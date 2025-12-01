variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "ap-south-1"
}

variable "s3_event_lambda_package_path" {
  description = "Path to the s3 event Lambda deployment zip"
  type        = string
  default     = "../../dist/s3EventHandler.zip"
}

variable "lambda_package_path" {
  description = "Path to the Lambda deployment zip"
  type        = string
  default     = "../../dist/api.zip"
}

variable "stage_name" {
  description = "API Gateway stage name"
  type        = string
  default     = "dev"
}

variable "tags" {
  description = "Common resource tags"
  type        = map(string)
  default     = {
    project = "imageservice"
    env     = "dev"
  }
}

variable "throttling_rate_limit" {
  description = "API Gateway requests per second"
  type        = number
  default     = 100
}

variable "throttling_burst_limit" {
  description = "API Gateway concurrent requests"
  type        = number
  default     = 50
}

variable "cors_allowed_origins" {
  description = "CORS allowed origins (* for public API, specific domains for private)"
  type        = list(string)
  default     = ["*"]
}

variable "s3_bucket_name" {
  description = "Name of the S3 bucket for image storage"
  type        = string
  default     = "imageservice-dev"
}

variable "dynamodb_table_name" {
  description = "Name of the DynamoDB table for image metadata"
  type        = string
  default     = "ImageMetadata"
}