-- =====================================================
-- Food Stall Discovery Platform - Database Schema
-- PostgreSQL with PostGIS Extension
-- =====================================================

-- Enable PostGIS extension for geospatial capabilities
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE
-- Stores user profiles with phone authentication
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100),
    email VARCHAR(255),
    preferences JSONB DEFAULT '{
        "dietary": "veg",
        "spice_tolerance": "medium",
        "language": "en"
    }'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast phone number lookups (used in OTP authentication)
CREATE INDEX idx_users_phone ON users(phone_number);

-- =====================================================
-- STALLS TABLE
-- Core stall information with geospatial data
-- =====================================================
CREATE TABLE stalls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    
    -- PostGIS Geography type for precise location tracking
    -- SRID 4326 = WGS84 (standard GPS coordinates)
    location GEOGRAPHY(Point, 4326) NOT NULL,
    
    -- Real-time status fields
    is_open BOOLEAN DEFAULT false,
    last_status_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Business information
    cuisine_type VARCHAR(100), -- e.g., "Chaat", "Dosa", "Pani Puri"
    description TEXT,
    menu_text TEXT, -- Simple text-based menu
    price_range VARCHAR(20), -- e.g., "₹20-₹100"
    
    -- Hygiene and verification
    hygiene_badges JSONB DEFAULT '{
        "fssai_verified": false,
        "owner_declared_hygiene": [],
        "hygiene_photos": []
    }'::jsonb,
    
    -- Dietary tags
    dietary_tags VARCHAR[] DEFAULT ARRAY[]::VARCHAR[], -- e.g., ["Jain", "Halal", "Vegan"]
    
    -- Contact
    contact_number VARCHAR(15),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- CRITICAL: Spatial index for fast "nearby" queries
CREATE INDEX idx_stalls_location ON stalls USING GIST(location);

-- Index for filtering by open status
CREATE INDEX idx_stalls_is_open ON stalls(is_open);

-- Index for owner lookups
CREATE INDEX idx_stalls_owner ON stalls(owner_id);

-- Index for cuisine search
CREATE INDEX idx_stalls_cuisine ON stalls(cuisine_type);

-- GIN index for dietary tags array search
CREATE INDEX idx_stalls_dietary_tags ON stalls USING GIN(dietary_tags);

-- =====================================================
-- REVIEWS TABLE
-- User reviews with hygiene-specific feedback
-- =====================================================
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stall_id UUID NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Ratings
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    hygiene_score INTEGER NOT NULL CHECK (hygiene_score >= 1 AND hygiene_score <= 5),
    
    -- Hygiene-specific feedback
    hygiene_tags JSONB DEFAULT '[]'::jsonb,
    -- Example: ["gloves_used", "clean_water", "fssai_visible", "covered_food"]
    
    -- Review content
    comment TEXT,
    
    -- Hygiene questions (Yes/No responses)
    hygiene_responses JSONB DEFAULT '{
        "vendor_wears_gloves": null,
        "filtered_water_visible": null,
        "clean_utensils": null,
        "covered_food_storage": null
    }'::jsonb,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate reviews from same user
    UNIQUE(stall_id, user_id)
);

-- Index for fetching reviews by stall
CREATE INDEX idx_reviews_stall ON reviews(stall_id);

-- Index for user's review history
CREATE INDEX idx_reviews_user ON reviews(user_id);

-- GIN index for hygiene tags queries
CREATE INDEX idx_reviews_hygiene_tags ON reviews USING GIN(hygiene_tags);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to calculate aggregated hygiene score for a stall
CREATE OR REPLACE FUNCTION calculate_hygiene_score(stall_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    avg_score DECIMAL(3,2);
    positive_count INTEGER;
    total_reviews INTEGER;
BEGIN
    -- Get average hygiene score from reviews
    SELECT 
        COALESCE(AVG(hygiene_score), 0),
        COUNT(*)
    INTO avg_score, total_reviews
    FROM reviews
    WHERE stall_id = stall_uuid;
    
    -- Count positive hygiene tags across all reviews
    SELECT COUNT(*)
    INTO positive_count
    FROM reviews,
    jsonb_array_elements_text(hygiene_tags) AS tag
    WHERE stall_id = stall_uuid
    AND tag IN ('gloves_used', 'clean_water', 'fssai_visible', 'covered_food', 
                'clean_area', 'hairnet_used', 'mineral_water');
    
    -- Weighted calculation: 70% from scores, 30% from positive tag density
    IF total_reviews > 0 THEN
        RETURN (avg_score * 0.7) + ((positive_count::DECIMAL / total_reviews) * 0.3 * 5);
    ELSE
        RETURN 0;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update last_status_update timestamp
CREATE OR REPLACE FUNCTION update_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_status_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update timestamp when is_open changes
CREATE TRIGGER trigger_update_status_timestamp
BEFORE UPDATE OF is_open ON stalls
FOR EACH ROW
WHEN (OLD.is_open IS DISTINCT FROM NEW.is_open)
EXECUTE FUNCTION update_status_timestamp();

-- =====================================================
-- SEED DATA (for testing)
-- =====================================================

-- Insert sample users
INSERT INTO users (phone_number, name, preferences) VALUES
('+919876543210', 'Rajesh Kumar', '{"dietary": "veg", "spice_tolerance": "high", "language": "hi"}'::jsonb),
('+919876543211', 'Priya Sharma', '{"dietary": "non-veg", "spice_tolerance": "medium", "language": "en"}'::jsonb),
('+919876543212', 'Raju (Chaat Vendor)', '{"dietary": "veg", "spice_tolerance": "high", "language": "hi"}'::jsonb);

-- Insert sample stalls (Mumbai coordinates)
-- Raju's Chaat Stall
INSERT INTO stalls (owner_id, name, location, is_open, cuisine_type, description, menu_text, price_range, dietary_tags, contact_number, hygiene_badges)
SELECT 
    id,
    'Raju''s Famous Chaat Corner',
    ST_GeogFromText('POINT(72.8777 19.0760)'), -- Colaba, Mumbai
    true,
    'Chaat',
    'Best Pani Puri and Bhel in South Mumbai. Family business since 1985.',
    'Pani Puri: ₹30, Bhel Puri: ₹40, Sev Puri: ₹50, Dahi Puri: ₹60',
    '₹30-₹60',
    ARRAY['Jain', 'Vegan'],
    '+919876543212',
    '{"fssai_verified": true, "owner_declared_hygiene": ["gloves", "filtered_water"], "hygiene_photos": ["fssai_cert.jpg"]}'::jsonb
FROM users WHERE phone_number = '+919876543212';

-- Priya's Dosa Cart
INSERT INTO stalls (owner_id, name, location, is_open, cuisine_type, description, menu_text, price_range, dietary_tags, contact_number)
SELECT 
    id,
    'South Indian Dosa Express',
    ST_GeogFromText('POINT(72.8311 18.9388)'), -- Andheri, Mumbai
    false,
    'South Indian',
    'Fresh made-to-order dosas with authentic sambhar',
    'Plain Dosa: ₹40, Masala Dosa: ₹60, Cheese Dosa: ₹80, Set Dosa: ₹70',
    '₹40-₹80',
    ARRAY['Vegetarian', 'Jain'],
    '+919876543211'
FROM users WHERE phone_number = '+919876543211';

-- Insert sample reviews
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
AND u.phone_number = '+919876543210';

-- Display success message
DO $$
BEGIN
    RAISE NOTICE 'Database schema created successfully!';
    RAISE NOTICE 'PostGIS version: %', PostGIS_Version();
    RAISE NOTICE 'Total tables created: 3 (users, stalls, reviews)';
    RAISE NOTICE 'Sample data: % users, % stalls, % reviews', 
        (SELECT COUNT(*) FROM users),
        (SELECT COUNT(*) FROM stalls),
        (SELECT COUNT(*) FROM reviews);
END $$;
