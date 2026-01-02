# DGIHub Platform - Deployment Guide

## Production Deployment

### Prerequisites

- AWS Account with appropriate permissions
- Domain name configured
- SSL certificate (AWS Certificate Manager)
- Database backup strategy

### Step 1: Infrastructure Setup

#### 1.1 Create RDS PostgreSQL Instance

```bash
aws rds create-db-instance \
  --db-instance-identifier dgihub-prod \
  --db-instance-class db.r6g.2xlarge \
  --engine postgres \
  --engine-version 15.4 \
  --master-username postgres \
  --master-user-password <secure-password> \
  --allocated-storage 500 \
  --storage-type gp3 \
  --multi-az \
  --backup-retention-period 30 \
  --region ap-southeast-5
```

#### 1.2 Create ECS Cluster

```bash
aws ecs create-cluster \
  --cluster-name dgihub-production \
  --capacity-providers FARGATE FARGATE_SPOT \
  --default-capacity-provider-strategy \
    capacityProvider=FARGATE,weight=1 \
    capacityProvider=FARGATE_SPOT,weight=1
```

#### 1.3 Set Up CloudHSM

```bash
# Create CloudHSM cluster
aws cloudhsmv2 create-cluster \
  --hsm-type hsm1.medium \
  --subnet-ids <subnet-id-1> <subnet-id-2> \
  --region ap-southeast-5
```

### Step 2: Environment Configuration

Create production `.env` file:

```bash
NODE_ENV=production
PORT=3000

# Database
DB_HOST=<rds-endpoint>
DB_PORT=5432
DB_NAME=dgihub
DB_USER=postgres
DB_PASSWORD=<secure-password>
DB_SSL=true

# JWT
JWT_SECRET=<generate-secure-random-string>
JWT_REFRESH_SECRET=<generate-secure-random-string>

# AWS
AWS_ACCESS_KEY_ID=<access-key>
AWS_SECRET_ACCESS_KEY=<secret-key>
AWS_REGION=ap-southeast-5
S3_BUCKET=dgihub-prod

# External APIs
DUKCAPIL_API_KEY=<key>
SIPLATIH_CLIENT_ID=<id>
SIPLATIH_CLIENT_SECRET=<secret>
```

### Step 3: Build and Deploy

#### 3.1 Build Docker Image

```bash
docker build -t dgihub-api:latest .
```

#### 3.2 Push to ECR

```bash
aws ecr create-repository --repository-name dgihub-api
docker tag dgihub-api:latest <account-id>.dkr.ecr.ap-southeast-5.amazonaws.com/dgihub-api:latest
docker push <account-id>.dkr.ecr.ap-southeast-5.amazonaws.com/dgihub-api:latest
```

#### 3.3 Deploy to ECS

```bash
aws ecs create-service \
  --cluster dgihub-production \
  --service-name dgihub-api \
  --task-definition dgihub-api \
  --desired-count 3 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-1,subnet-2],securityGroups=[sg-1],assignPublicIp=DISABLED}"
```

### Step 4: Database Migration

```bash
# Run migrations
npm run db:migrate

# Verify
psql -h <rds-endpoint> -U postgres -d dgihub -c "\dt"
```

### Step 5: Set Up Monitoring

#### 5.1 CloudWatch Alarms

```bash
# High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name dgihub-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold
```

#### 5.2 Application Logs

Logs are automatically sent to CloudWatch Logs from ECS.

### Step 6: SSL and Domain

#### 6.1 Request Certificate

```bash
aws acm request-certificate \
  --domain-name api.dgihub.go.id \
  --validation-method DNS \
  --region ap-southeast-5
```

#### 6.2 Configure API Gateway

- Create API Gateway v2 (HTTP API)
- Configure custom domain
- Attach SSL certificate
- Set up route to ECS service

### Step 7: Security Hardening

1. **Enable WAF**
   ```bash
   aws wafv2 create-web-acl --name dgihub-waf --scope REGIONAL
   ```

2. **Set Up DDoS Protection**
   - Enable AWS Shield Standard (automatic)
   - Consider Shield Advanced for production

3. **Configure Security Groups**
   - Only allow necessary ports
   - Restrict source IPs for admin access

### Step 8: Backup Strategy

#### 8.1 Database Backups

- RDS automated backups (enabled by default)
- Daily snapshots
- 30-day retention

#### 8.2 Application Backups

```bash
# Backup S3 bucket
aws s3 sync s3://dgihub-prod s3://dgihub-backup/$(date +%Y%m%d)
```

### Step 9: Health Checks

#### 9.1 Application Health

```bash
curl https://api.dgihub.go.id/health
```

#### 9.2 Database Health

```bash
psql -h <rds-endpoint> -U postgres -d dgihub -c "SELECT 1"
```

### Step 10: Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 https://api.dgihub.go.id/health

# Using k6
k6 run load-test.js
```

---

## Docker Deployment

### Quick Start

```bash
# Build
docker build -t dgihub-api .

# Run
docker run -d \
  --name dgihub-api \
  -p 3000:3000 \
  --env-file .env \
  dgihub-api
```

### Docker Compose (Production)

```bash
# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f api

# Scale services
docker-compose up -d --scale api=3
```

---

## Monitoring & Maintenance

### Daily Tasks

- Check application logs
- Monitor error rates
- Review security alerts
- Check database performance

### Weekly Tasks

- Review usage metrics
- Check backup status
- Update dependencies
- Security patch review

### Monthly Tasks

- Performance optimization
- Cost review
- Security audit
- Capacity planning

---

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Check security groups
   - Verify credentials
   - Check RDS status

2. **High Latency**
   - Check CloudWatch metrics
   - Review database queries
   - Consider caching

3. **Memory Issues**
   - Increase ECS task memory
   - Review application code
   - Check for memory leaks

---

**For detailed infrastructure setup, see `docs/architecture/infrastructure-design.md`**


