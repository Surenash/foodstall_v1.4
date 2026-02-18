# Food Stall Discovery Platform - Deployment Guide

## Overview

This guide covers deploying the Food Stall Discovery Platform to production using various deployment strategies.

---

## Deployment Options

### Option 1: Docker Deployment (Recommended)

**Prerequisites:**
- Docker & Docker Compose installed
- Domain name (optional)
- SSL certificates (Let's Encrypt recommended)

**Steps:**

1. **Clone repository and setup environment:**
```bash
cd /path/to/food_stall
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

2. **Set environment variables:**
```bash
export DB_PASSWORD="strong_secure_password"
export JWT_SECRET=$(openssl rand -base64 32)
```

3. **Start services:**
```bash
docker-compose up -d
```

4. **Verify deployment:**
```bash
# Check services
docker-compose ps

# Check logs
docker-compose logs -f backend

# Test API
curl http://localhost:3000/health
```

5. **Stop services:**
```bash
docker-compose down
```

**Production Configuration:**

Edit `docker-compose.yml` for production:
- Use proper secrets management (Docker Secrets, AWS Secrets Manager)
- Configure reverse proxy (Nginx, Traefik)
- Set up SSL/TLS certificates
- Enable logging and monitoring

---

### Option 2: Cloud Deployment (AWS)

**Architecture:**
- **Database:** Amazon RDS PostgreSQL with PostGIS
- **Backend:** Elastic Beanstalk or ECS
- **Static Files:** S3 + CloudFront
- **Region:** Mumbai (ap-south-1) for low latency

**Steps:**

1. **Create RDS PostgreSQL instance:**
```bash
aws rds create-db-instance \
  --db-instance-identifier foodstall-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14.7 \
  --master-username postgres \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20 \
  --region ap-south-1
```

2. **Enable PostGIS:**
```bash
psql -h your-rds-endpoint -U postgres -d foodstall_db \
  -c "CREATE EXTENSION postgis; CREATE EXTENSION \"uuid-ossp\";"
```

3. **Deploy schema:**
```bash
psql -h your-rds-endpoint -U postgres -d foodstall_db \
  < database/schema.sql
```

4. **Deploy backend to Elastic Beanstalk:**
```bash
cd backend
eb init -p node.js-18 foodstall-api --region ap-south-1
eb create foodstall-api-prod
eb setenv DB_HOST=your-rds-endpoint DB_PASSWORD=YOUR_PASSWORD
eb deploy
```

5. **Configure S3 for file uploads:**
```bash
aws s3 mb s3://foodstall-hygiene-photos --region ap-south-1
aws s3api put-bucket-cors --bucket foodstall-hygiene-photos \
  --cors-configuration file://s3-cors.json
```

---

### Option 3: Google Cloud Platform

**Architecture:**
- **Database:** Cloud SQL PostgreSQL with PostGIS
- **Backend:** Cloud Run or App Engine
- **Storage:** Cloud Storage
- **Region:** Mumbai (asia-south1)

**Steps:**

1. **Create Cloud SQL instance:**
```bash
gcloud sql instances create foodstall-db \
  --database-version=POSTGRES_14 \
  --tier=db-f1-micro \
  --region=asia-south1
```

2. **Create database:**
```bash
gcloud sql databases create foodstall_db --instance=foodstall-db
```

3. **Enable PostGIS:**
```bash
gcloud sql connect foodstall-db --user=postgres
CREATE EXTENSION postgis;
CREATE EXTENSION "uuid-ossp";
```

4. **Deploy to Cloud Run:**
```bash
cd backend
gcloud builds submit --tag gcr.io/PROJECT_ID/foodstall-backend
gcloud run deploy foodstall-api \
  --image gcr.io/PROJECT_ID/foodstall-backend \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars DB_HOST=/cloudsql/PROJECT_ID:asia-south1:foodstall-db
```

---

### Option 4: Heroku (Quick Deploy)

**Steps:**

1. **Install Heroku CLI:**
```bash
brew install heroku/brew/heroku  # macOS
```

2. **Create Heroku app:**
```bash
cd backend
heroku create foodstall-api
```

3. **Add PostgreSQL with PostGIS:**
```bash
heroku addons:create heroku-postgresql:mini
heroku pg:psql -c "CREATE EXTENSION postgis;"
heroku pg:psql -c "CREATE EXTENSION \"uuid-ossp\";"
```

4. **Deploy:**
```bash
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

5. **Run schema:**
```bash
heroku pg:psql < ../database/schema.sql
```

---

## Mobile App Deployment

### Android

**1. Generate release APK:**
```bash
cd mobile
cd android
./gradlew assembleRelease
```

**2. Sign APK:**
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 \
  -keystore my-release-key.keystore \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  alias_name
```

**3. Align APK:**
```bash
zipalign -v 4 app-release-unsigned.apk FoodStallApp.apk
```

**4. Publish to Google Play:**
- Create app listing
- Upload APK/AAB
- Set content rating
- Add screenshots and descriptions

### iOS

**1. Configure in Xcode:**
```bash
cd mobile/ios
open FoodStallApp.xcworkspace
```

**2. Set provisioning profiles:**
- Select project in Xcode
- Signing & Capabilities
- Select team and provisioning profile

**3. Archive and upload:**
- Product → Archive
- Distribute App → App Store Connect
- Upload

**4. Submit to App Store:**
- Create app listing in App Store Connect
- Upload screenshots
- Submit for review

---

## Production Checklist

### Backend

- [ ] Set strong `JWT_SECRET`
- [ ] Use strong database password
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable logging (Winston, Morgan)
- [ ] Set up monitoring (PM2, New Relic)
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline
- [ ] Enable error tracking (Sentry)

### Database

- [ ] Enable automated backups
- [ ] Set up replication (if needed)
- [ ] Configure connection pooling
- [ ] Optimize indexes
- [ ] Set up monitoring
- [ ] Enable query logging for slow queries

### Mobile App

- [ ] Update API base URL to production
- [ ] Configure Google Maps API key
- [ ] Set up crash reporting (Firebase Crashlytics)
- [ ] Enable ProGuard (Android)
- [ ] Configure app signing
- [ ] Test on real devices
- [ ] Optimize images and assets
- [ ] Add app icons and splash screens

### External Services

- [ ] Integrate SMS service (Twilio, AWS SNS)
  ```bash
  npm install twilio
  ```
  
- [ ] Set up S3/Cloud Storage for images
  ```bash
  npm install aws-sdk
  ```
  
- [ ] Configure Google Maps API
  - Enable Maps SDK for Android/iOS
  - Enable Places API
  - Enable Directions API

### Security

- [ ] Implement rate limiting per endpoint
- [ ] Add request validation
- [ ] Sanitize user inputs
- [ ] Enable CSRF protection
- [ ] Set security headers (Helmet.js)
- [ ] Implement photo moderation
- [ ] Add content filtering
- [ ] Set up DDoS protection
- [ ] Enable audit logging

### Compliance

- [ ] Create Privacy Policy
- [ ] Create Terms of Service
- [ ] DPDPA compliance (India)
- [ ] Location data consent
- [ ] User data deletion flow
- [ ] Cookie policy (if web version)

---

## Environment Variables

### Production Backend (.env)

```bash
# Database
DB_HOST=your-production-db-host
DB_PORT=5432
DB_NAME=foodstall_db
DB_USER=postgres
DB_PASSWORD=your-strong-password

# Server
PORT=3000
NODE_ENV=production

# Security
JWT_SECRET=your-32-character-secret

# External Services
SMS_API_KEY=your-twilio-key
AWS_ACCESS_KEY=your-aws-key
AWS_SECRET_KEY=your-aws-secret
AWS_S3_BUCKET=foodstall-photos
MAPS_API_KEY=your-google-maps-key

# Monitoring
SENTRY_DSN=your-sentry-dsn
```

---

## Monitoring & Maintenance

### Health Checks

```bash
# Backend health
curl https://api.yourapp.com/health

# Database connectivity
curl https://api.yourapp.com/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=1000
```

### Logs

```bash
# Docker logs
docker-compose logs -f backend

# PM2 logs (if using PM2)
pm2 logs

# Cloud logs
# AWS: CloudWatch
# GCP: Cloud Logging
```

### Backups

**Automated PostgreSQL backups:**
```bash
# Daily backup script
pg_dump -h $DB_HOST -U postgres foodstall_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Upload to S3
aws s3 cp backup_$(date +%Y%m%d).sql.gz s3://your-backup-bucket/
```

---

## Scaling Considerations

### Database Scaling
- Read replicas for analytics queries
- Connection pooling (PgBouncer)
- Partitioning for large tables

### Backend Scaling
- Horizontal scaling with load balancer
- Redis for session storage
- CDN for static assets
- Caching layer (Redis/Memcached)

### Mobile App
- CDN for app updates
- Feature flags for gradual rollout
- A/B testing framework

---

## Cost Estimation (Monthly)

### Small Scale (1000 users)
- **AWS:**
  - RDS PostgreSQL (db.t3.micro): $15
  - Elastic Beanstalk (t3.small): $15
  - S3 storage (10GB): $0.25
  - **Total: ~$30/month**

### Medium Scale (10,000 users)
- **AWS:**
  - RDS PostgreSQL (db.t3.medium): $60
  - ECS Fargate: $50
  - S3 + CloudFront: $10
  - **Total: ~$120/month**

### Large Scale (100,000 users)
- **AWS:**
  - RDS PostgreSQL (db.r5.large): $200
  - ECS with autoscaling: $200
  - S3 + CloudFront: $50
  - **Total: ~$450/month**

---

## Support & Resources

- **Documentation:** See README.md, API_DOCUMENTATION.md
- **PostGIS Docs:** https://postgis.net/documentation/
- **React Native Docs:** https://reactnative.dev/
- **Docker Docs:** https://docs.docker.com/

---

## Troubleshooting

**Database connection issues:**
- Check firewall rules
- Verify security groups (AWS)
- Check connection string format

**PostGIS errors:**
- Ensure extension is enabled
- Check PostgreSQL version compatibility

**Mobile app crashes:**
- Check Sentry/Crashlytics logs
- Verify API endpoints are accessible
- Check API key configuration

---

**For production support, refer to your cloud provider's documentation and support channels.**
