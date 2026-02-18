-- =====================================================
-- Food Stall App - Customer Features Migration
-- Add tables for favorites, notifications, and reports
-- =====================================================

-- =====================================================
-- FAVORITES TABLE
-- User's bookmarked stalls
-- =====================================================
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stall_id UUID NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevent duplicate favorites
    UNIQUE(user_id, stall_id)
);

-- Index for fetching user's favorites
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);

-- Index for checking if stall is favorited
CREATE INDEX IF NOT EXISTS idx_favorites_stall ON favorites(stall_id);

-- =====================================================
-- NOTIFICATIONS TABLE
-- User notifications for alerts and updates
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'favorite_stall_open', 'review_reply', 'special_offer', 'system'
    title VARCHAR(255) NOT NULL,
    body TEXT,
    data JSONB DEFAULT '{}'::jsonb, -- Additional data like stall_id, review_id
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching user's notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Index for unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, read) WHERE read = false;

-- =====================================================
-- REPORTS/FEEDBACK TABLE
-- User reports for stall issues or suggestions
-- =====================================================
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stall_id UUID REFERENCES stalls(id) ON DELETE SET NULL, -- NULL for new stall suggestions
    type VARCHAR(50) NOT NULL, -- 'incorrect_info', 'closed_permanently', 'hygiene_issue', 'new_stall_suggestion'
    description TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'resolved', 'rejected'
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for fetching user's reports
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);

-- Index for admin review queue
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- =====================================================
-- UPDATE USERS TABLE
-- Add new fields for profile photo and notification preferences
-- =====================================================
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(500);
ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "favorite_stall_open": true,
    "review_replies": true,
    "special_offers": true,
    "system_updates": true
}'::jsonb;

-- =====================================================
-- SEARCH HISTORY TABLE (Optional, can use AsyncStorage on mobile)
-- For popular searches feature
-- =====================================================
CREATE TABLE IF NOT EXISTS search_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    query VARCHAR(255) NOT NULL,
    search_type VARCHAR(50) DEFAULT 'stall', -- 'stall', 'cuisine', 'location'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for user's recent searches
CREATE INDEX IF NOT EXISTS idx_search_history_user ON search_history(user_id, created_at DESC);

-- Index for popular searches (aggregation)
CREATE INDEX IF NOT EXISTS idx_search_history_query ON search_history(query);

-- =====================================================
-- Display migration success
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'New tables: favorites, notifications, reports, search_history';
    RAISE NOTICE 'Updated tables: users (added profile_photo, notification_preferences)';
END $$;
