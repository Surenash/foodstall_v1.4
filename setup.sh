#!/bin/bash

# Food Stall Discovery Platform - Quick Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "╔════════════════════════════════════════════════════════╗"
echo "║  Food Stall Discovery Platform - Setup Script          ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print success message
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Function to print warning message
warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Function to print error message
error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if PostgreSQL is installed
echo "Checking prerequisites..."
if ! command -v psql &> /dev/null; then
    error "PostgreSQL is not installed"
    echo "Please install PostgreSQL first:"
    echo "  macOS: brew install postgresql postgis"
    echo "  Ubuntu: sudo apt-get install postgresql postgresql-contrib postgis"
    exit 1
fi
success "PostgreSQL is installed"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    error "Node.js is not installed"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi
success "Node.js is installed ($(node --version))"

# Database setup
echo ""
echo "Setting up database..."
read -p "Enter PostgreSQL database name (default: foodstall_db): " DB_NAME
DB_NAME=${DB_NAME:-foodstall_db}

read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -sp "Enter PostgreSQL password: " DB_PASSWORD
echo ""

# Create database
echo "Creating database..."
if createdb "$DB_NAME" 2>/dev/null; then
    success "Database '$DB_NAME' created"
else
    warning "Database '$DB_NAME' already exists"
fi

# Enable PostGIS
echo "Enabling PostGIS extension..."
psql "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis;" 2>/dev/null
psql "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";" 2>/dev/null
success "PostGIS extension enabled"

# Run schema
echo "Running database schema..."
if [ -f "database/schema.sql" ]; then
    psql "$DB_NAME" < database/schema.sql > /dev/null 2>&1
    success "Database schema created"
else
    error "database/schema.sql not found"
    exit 1
fi

# Backend setup
echo ""
echo "Setting up backend..."
cd backend

if [ ! -f "package.json" ]; then
    error "backend/package.json not found"
    exit 1
fi

echo "Installing backend dependencies..."
npm install --silent
success "Backend dependencies installed"

# Create .env file
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env <<EOF
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASSWORD=$DB_PASSWORD

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret (change in production)
JWT_SECRET=$(openssl rand -base64 32)

# Socket.io Configuration
SOCKET_PORT=3001

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_DIR=./uploads
EOF
    success ".env file created"
else
    warning ".env file already exists, skipping"
fi

# Create uploads directory
mkdir -p uploads/hygiene-photos
success "Uploads directory created"

cd ..

# Mobile setup
echo ""
echo "Setting up mobile app..."
cd mobile

if [ ! -f "package.json" ]; then
    error "mobile/package.json not found"
    exit 1
fi

echo "Installing mobile dependencies..."
npm install --silent
success "Mobile dependencies installed"

cd ..

# Final message
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║  ✓ Setup Complete!                                     ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo ""
echo "1. Start the backend server:"
echo "   cd backend"
echo "   npm run dev"
echo ""
echo "2. In another terminal, start the mobile app:"
echo "   cd mobile"
echo "   npm run android  # or npm run ios"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:3000/health"
echo ""
echo "4. Test nearby stalls (Mumbai coordinates):"
echo "   curl \"http://localhost:3000/api/v1/stalls/nearby?lat=19.0760&long=72.8777&radius=5000\""
echo ""
echo "For more information, see README.md"
