terraform {
  backend "s3" {
    bucket                = "imageservice-tfstate-768477845606"
    key                   = "terraform.tfstate"
    # Store state per-workspace: imageservice/<workspace>/terraform.tfstate
    workspace_key_prefix  = "imageservice"
    region                = "us-east-1"
    use_lockfile          = true
    encrypt               = true
  }
}

# NOTE:
# - Backend values cannot use variables. Replace bucket with a real, globally unique name.
# - Create the S3 state bucket once manually or via the provided bootstrap in infra/bootstrap.
# - After updating, run `terraform init -migrate-state`.
