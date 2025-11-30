variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "lambda_package_path" {
  description = "Path to the Lambda deployment zip"
  type        = string
  default     = "../../dist/handler.zip"
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
