terraform {
  required_version = ">= 1.3.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = var.tags
  }
}

# --- Existing S3 Bucket (preserve) ---
# Prevent destroy to avoid 409 on versioned bucket; we will switch to a new bucket.
resource "aws_s3_bucket" "images" {
  bucket = "imageservice-768477845606-ap-south-1"
  tags   = var.tags
  lifecycle {
    prevent_destroy = false
  }
}

resource "aws_s3_bucket_versioning" "images" {
  bucket = aws_s3_bucket.images.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images" {
  bucket = aws_s3_bucket.images.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "images" {
  bucket                  = aws_s3_bucket.images.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- New S3 Bucket for Image Storage ---
resource "aws_s3_bucket" "images_new" {
  bucket        = var.s3_bucket_name
  force_destroy = true
  tags          = var.tags
}

resource "aws_s3_bucket_versioning" "images_new" {
  bucket = aws_s3_bucket.images_new.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "images_new" {
  bucket = aws_s3_bucket.images_new.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "images_new" {
  bucket                  = aws_s3_bucket.images_new.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# --- DynamoDB Table for Image Metadata ---
resource "aws_dynamodb_table" "image_metadata" {
  name         = "ImageMetadata"
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "imageId"

  attribute {
    name = "imageId"
    type = "S"
  }

  tags = var.tags
}

# --- Get current AWS account ID ---
data "aws_caller_identity" "current" {}

# --- IAM role for Lambda ---
data "aws_iam_policy_document" "lambda_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
  }
}

module "iam" {
  source              = "./modules/iam"
  tags                = var.tags
  s3_bucket_arn       = aws_s3_bucket.images_new.arn
  dynamodb_table_arn  = aws_dynamodb_table.image_metadata.arn
}

# --- Lambda deployment package placeholder ---
# Expect build artifact at ../dist/handler.zip (we'll add npm script)
module "lambda" {
  source              = "./modules/lambda"
  function_name       = "imageservice"
  role_arn            = module.iam.lambda_role_arn
  lambda_package_path = var.lambda_package_path
  environment         = var.stage_name
  s3_bucket_name      = aws_s3_bucket.images_new.id
  dynamodb_table_name = aws_dynamodb_table.image_metadata.name
  tags                = var.tags
}

# --- API Gateway HTTP API ---
module "apigw" {
  source                 = "./modules/apigw"
  name                   = "imageservice-http-api"
  stage_name             = var.stage_name
  lambda_invoke_arn      = module.lambda.invoke_arn
  lambda_function_name   = module.lambda.function_name
  throttling_rate_limit  = var.throttling_rate_limit
  throttling_burst_limit = var.throttling_burst_limit
  cors_allowed_origins   = var.cors_allowed_origins
  tags                   = var.tags
}
