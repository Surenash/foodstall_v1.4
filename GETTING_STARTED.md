# Quick Start Guide - Food Stall Platform

## ⚠️ IMPORTANT: You need PostgreSQL with PostGIS

The backend requires PostgreSQL with PostGIS extension. You have 2 options:

---

## ✅ OPTION 1: Install PostgreSQL (Recommended)

### Step 1: Install PostgreSQL

```bash
# Install PostgreSQL and PostGIS
brew install postgresql@14 postgis

# Start PostgreSQL service
brew services start postgresql@14

# Add PostgreSQL to PATH
echo 'export PATH="/opt/homebrew/opt/postgresql@14/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Step 2: Create Database

```bash
# Create database
createdb foodstall_db

# Enable PostGIS
psql foodstall_db -c "CREATE EXTENSION postgis;"
psql foodstall_db -c "CREATE EXTENSION \"uuid-ossp\";"

# Run schema
psql foodstall_db < database/schema.sql
```

### Step 3: Configure Backend

```bash
cd backend

# Create .env file
cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=foodstall_db
DB_USER=$(whoami)
DB_PASSWORD=
PORT=3000
NODE_ENV=development
JWT_SECRET=$(openssl rand -base64 32)
EOF
```

### Step 4: Start Backend

```bash
# Still in backend directory
npm run dev
```

✅ Server should start on http://localhost:3000

---

## 🐳 OPTION 2: Use Docker (Easiest - No PostgreSQL Install)

### Prerequisites
- Install Docker Desktop: https://www.docker.com/products/docker-desktop/

### Step 1: Start All Services

```bash
# From project root
docker-compose up -d
```

This starts:
- PostgreSQL with PostGIS (automatically creates database and runs schema)
- Backend API server
- Redis (for caching)

### Step 2: View Logs

```bash
# Check backend logs
docker-compose logs -f backend

# Check database logs
docker-compose logs -f postgres
```

### Step 3: Test API

```bash
curl http://localhost:3000/health
```

### Step 4: Stop Services

```bash
docker-compose down
```

---

## 🧪 Test the API

Once backend is running:

```bash
# Health check
curl http://localhost:3000/health

# Get nearby stalls (Mumbai coordinates)
curl "http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=5000"
```

---

## 📱 Mobile App (After Backend is Running)

```bash
cd mobile
npm install

# For Android
npm run android

# For iOS (macOS only)
npm run ios
```

---

## 🔧 Troubleshooting

### PostgreSQL not found
```bash
# Check if PostgreSQL is installed
which psql

# If not found, install it:
brew install postgresql@14
```

### Port 3000 already in use
```bash
# Change PORT in backend/.env
PORT=3001
```

### Database connection error
```bash
# Check PostgreSQL is running
brew services list

# Restart if needed
brew services restart postgresql@14
```

### Docker issues
```bash
# Check Docker is running
docker --version

# Remove old containers
docker-compose down -v
docker-compose up -d
```

---

## 🎯 Recommended Approach

**For Development**: OPTION 1 (PostgreSQL install)
**For Quick Testing**: OPTION 2 (Docker)

---

## Next Steps

After backend is running:
1. Install mobile dependencies: `cd mobile && npm install`
2. Update API URL in mobile app if needed
3. Run mobile app: `npm run android` (or `npm run ios`)

---

**Need help?** Check README.md or DEPLOYMENT.md for detailed instructions.
