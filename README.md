# imageservice

Serverless image upload service built with TypeScript, AWS Lambda, API Gateway, S3, and DynamoDB.

## Architecture

- **AWS Lambda**: Node.js 18.x runtime (128MB memory, optimized for cost)
- **API Gateway HTTP API**: RESTful endpoints with throttling and CORS
- **S3**: Image storage with presigned URL generation
- **DynamoDB**: Image metadata persistence
- **Terraform**: Infrastructure as Code with modular design
- **TypeScript**: Type-safe application code with strict mode

## Features

- ✅ Presigned URL generation for secure S3 uploads
- ✅ Image metadata storage in DynamoDB
- ✅ API Gateway throttling (50 req/s dev, 500 req/s prod)
- ✅ CORS configuration (environment-aware)
- ✅ CloudWatch logging and monitoring
- ✅ Pre-commit hooks (Husky + lint-staged)
- ✅ Security scanning (npm audit)
- ✅ TypeScript with strict mode
- ✅ Jest testing framework

## Prerequisites

- Node.js 18 or higher
- npm (bundled with Node.js)
- AWS CLI configured with credentials
- Terraform 1.3+

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Build the Lambda Package

```bash
npm run build
npm run infra:package
```

This compiles TypeScript to CommonJS and packages the Lambda deployment artifact with dependencies

### 3. Deploy Infrastructure

#### Bootstrap Remote State (One-time setup)

```bash
cd infra/bootstrap
terraform init
terraform apply -var="bucket_name=imageservice-tfstate-<your-account-id>-us-east-1" -auto-approve
cd ../..
```

#### Deploy to Development

```bash
npm run infra:init
npm run infra:apply:dev
```

#### Deploy to Production

```bash
npm run infra:init
npm run infra:apply:prod
```

### 4. Get API URL

```bash
npm run infra:outputs
```

### 5. Test the API

```bash
# Generate presigned URL for image upload
curl -X POST "<api_base_url>/images/presign" \
  -H "Content-Type: application/json" \
  -d '{"filename": "test.jpg", "contentType": "image/jpeg"}'

# Upload image using presigned URL (returned from above)
curl -X PUT "<presigned_url>" \
  --upload-file ./test.jpg \
  -H "Content-Type: image/jpeg"

# Retrieve image metadata
curl "<api_base_url>/images/<image_id>"
```

## npm Scripts

### Build & Package

- `npm run build` - Compile TypeScript to CommonJS (dist/)
- `npm run infra:package` - Create Lambda deployment package (handler.zip)

### Infrastructure

- `npm run infra:init` - Initialize Terraform with backend
- `npm run infra:apply:dev` - Deploy to dev environment
- `npm run infra:outputs` - Show deployed API URL and account info
- `npm run infra:destroy:dev` - Destroy dev environment resources

### Testing & Quality

- `npm test` - Run Jest tests
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Security

- `npm run security:audit` - Scan dependencies for vulnerabilities
- `npm run security:fix` - Auto-fix npm audit issues

### Development

- `npm run local` - Run Lambda handler locally (for testing)

## Project Structure

```
.
├── src/
│   ├── handler.ts                      # Lambda entry point
│   ├── router.ts                       # Route dispatcher
│   ├── common/                         # Shared utilities
│   │   ├── apiResponse.ts
│   │   ├── errorHandler.ts
│   │   ├── errors.ts
│   │   ├── logger.ts                   # Winston console logging
│   │   └── response.ts
│   ├── config/
│   │   └── env.ts                      # Environment configuration
│   ├── controllers/
│   │   └── imageController.ts          # HTTP request handlers
│   ├── services/
│   │   ├── imageService.ts             # Business logic
│   │   └── imageStorageService.ts      # S3 integration
│   ├── repositories/
│   │   └── imageRepository.ts          # DynamoDB operations
│   └── models/
│       ├── image.model.ts
│       └── imageMetadata.model.ts
├── tests/
│   └── lambda.test.ts
├── infra/
│   ├── bootstrap/                      # Remote state S3 bucket
│   │   └── main.tf
│   └── terraform/
│       ├── main.tf                     # Root module
│       ├── backend.tf                  # S3 backend config
│       ├── variables.tf
│       ├── outputs.tf
│       ├── env/
│       │   ├── dev.tfvars             # Dev: 128MB, 50 req/s
│       │   └── prod.tfvars            # Prod: 128MB, 500 req/s
│       └── modules/
│           ├── lambda/                 # Lambda function
│           ├── apigw/                  # API Gateway HTTP API
│           └── iam/                    # IAM roles and policies
├── dist/                               # Build output (git-ignored)
├── package.json
├── tsconfig.json
└── README.md
```

## Infrastructure Details

### Remote State Backend

- **S3 Bucket**: `imageservice-tfstate-<account-id>-us-east-1`
- **Workspace Key Prefix**: Separates dev/prod state files
- **DynamoDB Lock Table**: Prevents concurrent modifications

### Lambda Configuration

- **Runtime**: Node.js 18.x
- **Memory**: 128MB (optimized for cost vs performance)
- **Timeout**: 15 seconds
- **Package Size**: ~2MB (AWS SDK externalized)
- **Logging**: CloudWatch Logs (14-day retention)

### API Gateway Configuration

- **Type**: HTTP API (lower cost than REST API)
- **Dev Throttling**: 50 requests/sec, 25 burst
- **Prod Throttling**: 500 requests/sec, 250 burst
- **CORS**: Wildcard in dev, restrictable in prod
- **Logging**: CloudWatch access logs enabled

### Security

- **Pre-commit Hooks**: Husky runs lint-staged + tests
- **Dependency Scanning**: npm audit on every commit
- **API Throttling**: Rate limiting at API Gateway
- **IAM Least Privilege**: Lambda role with minimal S3/DynamoDB permissions
- **AWS Shield Standard**: DDoS protection (included)

## Environment Configuration

### Development (dev.tfvars)

```hcl
environment          = "dev"
lambda_memory_size   = 128
lambda_timeout       = 15
throttling_rate_limit  = 50
throttling_burst_limit = 25
cors_allowed_origins = ["*"]
```

### Production (prod.tfvars)

```hcl
environment          = "prod"
lambda_memory_size   = 128
lambda_timeout       = 15
throttling_rate_limit  = 500
throttling_burst_limit = 250
cors_allowed_origins = ["*"]  # TODO: Restrict to specific domains
```

## Monitoring & Debugging

### View Lambda Logs

```bash
aws logs tail /aws/lambda/imageservice --follow
```

### Check Recent Errors

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/imageservice \
  --filter-pattern "ERROR" \
  --start-time $(date -u -v-10M +%s)000
```

### Monitor Memory Usage

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/imageservice \
  --filter-pattern "Max Memory Used"
```

## Troubleshooting

### Lambda Package Issues

- Ensure `npm run build` completes without errors
- Verify `dist/handler.zip` contains `node_modules/` and all compiled JS files
- Check `unzip -l dist/handler.zip` to inspect package contents

### Throttling Errors (429 responses)

- Dev limit: 50 req/s - suitable for testing
- Prod limit: 500 req/s - adjust in prod.tfvars if needed
- Check API Gateway CloudWatch metrics for throttled requests

## Known Limitations

- CORS in prod is currently set to wildcard (\*) - should be restricted to specific frontend domains
- No CloudWatch alarms configured - manual monitoring required
- No CI/CD pipeline - deployments are manual
- No health check endpoint

## Future Improvements

- [ ] Add CloudWatch alarms (Lambda errors, API 5xx, high duration)
- [ ] Implement GitHub Actions CI/CD pipeline
- [ ] Add health check endpoint (`GET /health`)
- [ ] Restrict prod CORS to specific domains
- [ ] Add request validation middleware
- [ ] Implement image processing (resize, optimize)

## License

ISC
