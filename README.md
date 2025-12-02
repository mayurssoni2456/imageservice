# imageservice
[![Coverage Report](https://img.shields.io/badge/coverage-view_report-blue)](https://mayurssoni2456.github.io/imageservice/)
## Notes
- I used AI as a productivity enhancer — mainly for boilerplate, syntax queries, and refactoring suggestions.
- I treated this assignment like a real project, solving the core problem myself and using AI where it added speed without sacrificing understanding
  
Serverless image upload service built with TypeScript, AWS Lambda, API Gateway, S3, and DynamoDB.

## Architecture

- **AWS Lambda**: Node.js 18.x runtime (128MB memory, optimized for cost)
- **API Gateway HTTP API**: RESTful endpoints with throttling and CORS
- **S3**: Image storage with presigned URL generation
- **DynamoDB**: Image metadata persistence
- **Terraform**: Infrastructure as Code with modular design
- **TypeScript**: Type-safe application code with strict mode

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
npm run infra:bootstrap:init
npm run infra:bootstrap:apply
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
- `npm run infra:package:all` - Create 2 Lambda deployment package

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

- `npm run local:presign` - Run Lambda handler locally (for testing)

## Infrastructure Details

### Lambda Configuration

- **Runtime**: Node.js 18.x
- **Memory**: 128MB (optimized for cost vs performance)
- **Timeout**: 15 seconds
- **Package Size**: ~785KB (AWS SDK externalized)
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

### Monitor Memory Usage

```bash
aws logs filter-log-events \
  --log-group-name /aws/lambda/imageservice \
  --filter-pattern "Max Memory Used"
```

## Known Limitations

- CORS in prod is currently set to wildcard (\*) - should be restricted to specific frontend domains
- No CloudWatch alarms configured - manual monitoring required
- No CI/CD pipeline - deployments are manual
- Currently, for code reusability maintaining API Lambda and s3EventLambda in the same codebase. This means 2 handler zip with different entry point. Later, I would structure something
```bash
imageservice/
├── packages/
│   ├── core/             # Shared: models, services, repos
│   ├── api/              # API handler + core dependency
│   └── processor/        # S3 handler + core dependency
└── infra/
```
