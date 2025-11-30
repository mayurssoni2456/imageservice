aws_region = "ap-south-1"
stage_name = "prod"

# Throttling limits (higher for prod)
throttling_rate_limit  = 500
throttling_burst_limit = 250

# CORS - Restrict to your domains in prod
# cors_allowed_origins = ["https://yourdomain.com", "https://app.yourdomain.com"]
cors_allowed_origins = ["*"]  # TODO: Change to specific domains

tags = {
  project = "imageservice"
  env     = "prod"
}
