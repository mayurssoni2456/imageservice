aws_region = "ap-south-1"
stage_name = "dev"

# Throttling limits (lower for dev)
throttling_rate_limit  = 50
throttling_burst_limit = 25

# CORS - Allow all origins in dev
cors_allowed_origins = ["*"]

tags = {
  project = "imageservice"
  env     = "dev"
}

# Explicit S3 bucket name for dev (must be globally unique)
s3_bucket_name = "imageservice-product-dev"
