variable "name" { type = string }
variable "stage_name" { type = string }
variable "lambda_invoke_arn" { type = string }
variable "lambda_function_name" { type = string }
variable "tags" { type = map(string) }

variable "throttling_rate_limit" {
  type        = number
  description = "Requests per second"
  default     = 100
}

variable "throttling_burst_limit" {
  type        = number
  description = "Concurrent requests"
  default     = 50
}

variable "cors_allowed_origins" {
  type        = list(string)
  description = "CORS allowed origins"
  default     = ["*"]
}
