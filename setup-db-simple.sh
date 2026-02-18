#!/bin/bash

# Food Stall Platform - PostgreSQL Setup (Without PostGIS)
# This script sets up the database without PostGIS for development

set -e

echo "=========================================="
echo "Food Stall Platform - Database Setup"
echo "=========================================="
echo ""

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo " PostgreSQL is not installed yet"
    echo "Please wait for 'brew install postgresql@15' to complete"
    exit 1
fi

echo "✓ PostgreSQL found"

# Start PostgreSQL
echo ""
echo "Starting PostgreSQL..."
brew services start postgresql@15

# Wait a bit for PostgreSQL to start
sleep 3

# Create database
echo ""
echo "Creating database 'foodstall_db'..."
createdb foodstall_db || echo "Database may already exist"

# Create simplified schema (without PostGIS initially)
echo ""
echo "Creating database tables..."

psql foodstall_db << 'EOF'
-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    preferences JSONB DEFAULT '{"dietary": "veg", "spice_tolerance": "medium", "language": "en"}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create stalls table (simplified - using lat/long columns instead of PostGIS)
CREATE TABLE IF NOT EXISTS stalls (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    is_open BOOLEAN DEFAULT false,
    last_status_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cuisine_type VARCHAR(100),
    description TEXT,
    menu_text TEXT,
    price_range VARCHAR(20),
    hygiene_badges JSONB DEFAULT '{"fssai_verified": false, "owner_declared_hygiene": [], "hygiene_photos": []}'::jsonb,
    dietary_tags TEXT[] DEFAULT ARRAY[]::TEXT[],
    contact_number VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for stalls
CREATE INDEX IF NOT EXISTS idx_stalls_owner ON stalls(owner_id);
CREATE INDEX IF NOT EXISTS idx_stalls_is_open ON stalls(is_open);
CREATE INDEX IF NOT EXISTS idx_stalls_cuisine ON stalls(cuisine_type);
CREATE INDEX IF NOT EXISTS idx_stalls_lat_long ON stalls(latitude, longitude);

-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    stall_id INTEGER NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    hygiene_score INTEGER NOT NULL CHECK (hygiene_score >= 1 AND hygiene_score <= 5),
    hygiene_tags JSONB DEFAULT '[]'::jsonb,
    comment TEXT,
    hygiene_responses JSONB DEFAULT '{"vendor_wears_gloves": null, "filtered_water_visible": null, "clean_utensils": null, "covered_food_storage": null}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(stall_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_stall ON reviews(stall_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);

-- Insert sample data
INSERT INTO users (phone_number, name, preferences) VALUES
('+919876543210', 'Rajesh Kumar', '{"dietary": "veg", "spice_tolerance": "high", "language": "hi"}'::jsonb),
('+919876543211', 'Priya Sharma', '{"dietary": "non-veg", "spice_tolerance": "medium", "language": "en"}'::jsonb),
('+919876543212', 'Raju (Chaat Vendor)', '{"dietary": "veg", "spice_tolerance": "high", "language": "hi"}'::jsonb)
ON CONFLICT (phone_number) DO NOTHING;

-- Insert sample stalls
INSERT INTO stalls (owner_id, name, latitude, longitude, is_open, cuisine_type, description, menu_text, price_range, dietary_tags, contact_number, hygiene_badges)
SELECT 
    id,
    'Raju''s Famous Chaat Corner',
    19.0760,
    72.8777,
    true,
    'Chaat',
    'Best Pani Puri and Bhel in South Mumbai. Family business since 1985.',
    'Pani Puri: ₹30, Bhel Puri: ₹40, Sev Puri: ₹50, Dahi Puri: ₹60',
    '₹30-₹60',
    ARRAY['Jain', 'Vegan'],
    '+919876543212',
    '{"fssai_verified": true, "owner_declared_hygiene": ["gloves", "filtered_water"], "hygiene_photos": ["fssai_cert.jpg"]}'::jsonb
FROM users WHERE phone_number = '+919876543212'
ON CONFLICT DO NOTHING;

INSERT INTO stalls (owner_id, name, latitude, longitude, is_open, cuisine_type, description, menu_text, price_range, dietary_tags, contact_number)
SELECT 
    id,
    'South Indian Dosa Express',
    18.9388,
    72.8311,
    false,
    'South Indian',
    'Fresh made-to-order dosas with authentic sambhar',
    'Plain Dosa: ₹40, Masala Dosa: ₹60, Cheese Dosa: ₹80, Set Dosa: ₹70',
    '₹40-₹80',
    ARRAY['Vegetarian', 'Jain'],
    '+919876543211'
FROM users WHERE phone_number = '+919876543211'
ON CONFLICT DO NOTHING;

-- Insert sample review
INSERT INTO reviews (stall_id, user_id, rating, hygiene_score, hygiene_tags, comment, hygiene_responses)
SELECT 
    s.id,
    u.id,
    5,
    5,
    '["gloves_used", "clean_water", "fssai_visible", "covered_food"]'::jsonb,
    'Absolutely amazing! Very clean and hygienic. Raju bhaiya always wears gloves.',
    '{"vendor_wears_gloves": true, "filtered_water_visible": true, "clean_utensils": true, "covered_food_storage": true}'::jsonb
FROM stalls s, users u
WHERE s.name = 'Raju''s Famous Chaat Corner'
AND u.phone_number = '+919876543210'
ON CONFLICT DO NOTHING;

EOFECHO "✓ Database schema created successfully!"
echo ""
echo "Sample data added:"
echo "  - 3 users"
echo "  - 2 stalls (Mumbai locations)"
echo "  - 1 review"
echo ""
echo "=========================================="
echo "Database setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. cd backend"
echo "2. Create .env file (copy from .env.example)"
echo "3. npm run dev"
