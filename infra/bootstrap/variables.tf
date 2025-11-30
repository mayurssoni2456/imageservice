variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "bucket_name" {
  description = "Globally unique S3 bucket name for Terraform state"
  type        = string
}

variable "tags" {
  description = "Common tags"
  type        = map(string)
  default     = {
    project = "imageservice"
    env     = "infra-bootstrap"
  }
}
