variable "tags" {
  type        = map(string)
  description = "Common tags"
}

variable "s3_bucket_arn" {
  type        = string
  description = "ARN of the S3 bucket for image storage"
}

variable "dynamodb_table_arn" {
  type        = string
  description = "ARN of the DynamoDB table for image metadata"
}
