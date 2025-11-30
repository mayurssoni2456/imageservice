resource "aws_lambda_function" "this" {
  function_name    = var.function_name
  role             = var.role_arn
  handler          = "handler.handler"
  runtime          = "nodejs18.x"
  filename         = var.lambda_package_path
  source_code_hash = filebase64sha256(var.lambda_package_path)

  memory_size = 128
  timeout     = 15

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "this" {
  name              = "/aws/lambda/${aws_lambda_function.this.function_name}"
  retention_in_days = 14
  tags              = var.tags
}

output "function_name" { value = aws_lambda_function.this.function_name }
output "function_arn" { value = aws_lambda_function.this.arn }
output "invoke_arn" { value = aws_lambda_function.this.invoke_arn }
