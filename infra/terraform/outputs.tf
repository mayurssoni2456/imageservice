data "aws_region" "current" {}

output "deployed_account_id" {
  description = "AWS account id used for deployment"
  value       = data.aws_caller_identity.current.account_id
}

output "deployed_region" {
  description = "AWS region used for deployment"
  value       = data.aws_region.current.name
}
output "api_base_url" {
  description = "HTTP API invoke URL"
  value       = module.apigw.stage_url
}

output "lambda_function_name" {
  description = "Deployed Lambda function name"
  value       = module.lambda.function_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for image storage"
  value       = aws_s3_bucket.images.id
}

output "dynamodb_table_name" {
  description = "DynamoDB table name for image metadata"
  value       = aws_dynamodb_table.image_metadata.name
}
