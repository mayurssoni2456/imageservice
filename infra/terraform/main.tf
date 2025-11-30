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
  source = "./modules/iam"
  tags   = var.tags
}

# --- Lambda deployment package placeholder ---
# Expect build artifact at ../dist/handler.zip (we’ll add npm script)
module "lambda" {
  source              = "./modules/lambda"
  function_name       = "imageservice"
  role_arn            = module.iam.lambda_role_arn
  lambda_package_path = var.lambda_package_path
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
