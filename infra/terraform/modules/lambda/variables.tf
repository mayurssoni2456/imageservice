variable "function_name" { type = string }
variable "role_arn" { type = string }
variable "lambda_package_path" { type = string }
variable "tags" { type = map(string) }
variable "environment" { type = string }
variable "s3_bucket_name" { type = string }
variable "dynamodb_table_name" { type = string }
variable "handler" { type = string }
