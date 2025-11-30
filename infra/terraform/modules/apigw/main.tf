resource "aws_apigatewayv2_api" "http" {
  name          = var.name
  protocol_type = "HTTP"

  cors_configuration {
    allow_origins = var.cors_allowed_origins
    allow_methods = ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    allow_headers = ["content-type", "x-api-key", "authorization"]
    max_age       = 300
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/apigateway/${var.name}"
  retention_in_days = 14
  tags              = var.tags
}

resource "aws_apigatewayv2_integration" "lambda" {
  api_id                 = aws_apigatewayv2_api.http.id
  integration_type       = "AWS_PROXY"
  integration_method     = "POST"
  integration_uri        = var.lambda_invoke_arn
  payload_format_version = "2.0"
}

resource "aws_apigatewayv2_route" "presign" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "POST /images/presign"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "getimage" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "GET /images/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "putimage" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "PUT /images/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_route" "deleteimage" {
  api_id    = aws_apigatewayv2_api.http.id
  route_key = "DELETE /images/{id}"
  target    = "integrations/${aws_apigatewayv2_integration.lambda.id}"
}

resource "aws_apigatewayv2_stage" "this" {
  api_id      = aws_apigatewayv2_api.http.id
  name        = var.stage_name
  auto_deploy = true

  default_route_settings {
    throttling_burst_limit = var.throttling_burst_limit
    throttling_rate_limit  = var.throttling_rate_limit
  }

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_logs.arn
    format = jsonencode({
      # Core request/response
      requestId        = "$context.requestId"
      requestTime      = "$context.requestTime"
      httpMethod       = "$context.httpMethod"
      routeKey         = "$context.routeKey"
      status           = "$context.status"
      
      # Performance metrics
      responseLatency    = "$context.responseLatency"
      integrationLatency = "$context.integrationLatency"
      responseLength     = "$context.responseLength"
      
      # Client info
      sourceIp         = "$context.identity.sourceIp"
      userAgent        = "$context.identity.userAgent"
      
      # Errors (only populated if error occurs)
      zErrorMessage     = "$context.error.message"
      zIntegrationError = "$context.integrationErrorMessage"
      
      # API context
      protocol         = "$context.protocol"
      stage            = "$context.stage"
    })
  }

  tags = var.tags
}

resource "aws_lambda_permission" "apigw_invoke" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.http.execution_arn}/*/*"
}

output "api_id" { value = aws_apigatewayv2_api.http.id }
output "stage_url" { value = aws_apigatewayv2_stage.this.invoke_url }
