const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Configure multer for profile photo uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/profile-photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG and PNG files are allowed'));
        }
    }
});

// =====================================================
// USER PROFILE ROUTES
// =====================================================

/**
 * GET /api/v1/users/:id
 * Get user profile
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT id, phone_number, name, email, profile_photo, preferences, 
                    notification_preferences, created_at, updated_at
             FROM users WHERE id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user', message: error.message });
    }
});

/**
 * PUT /api/v1/users/:id
 * Update user profile
 */
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, preferences, notification_preferences } = req.body;

        const updates = [];
        const values = [];
        let paramCount = 0;

        if (name !== undefined) {
            paramCount++;
            updates.push(`name = $${paramCount}`);
            values.push(name);
        }
        if (email !== undefined) {
            paramCount++;
            updates.push(`email = $${paramCount}`);
            values.push(email);
        }
        if (preferences !== undefined) {
            paramCount++;
            updates.push(`preferences = $${paramCount}`);
            values.push(JSON.stringify(preferences));
        }
        if (notification_preferences !== undefined) {
            paramCount++;
            updates.push(`notification_preferences = $${paramCount}`);
            values.push(JSON.stringify(notification_preferences));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        paramCount++;
        values.push(id);

        const result = await query(
            `UPDATE users SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user', message: error.message });
    }
});

/**
 * POST /api/v1/users/:id/photo
 * Upload profile photo
 */
router.post('/:id/photo', upload.single('photo'), async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.file) {
            return res.status(400).json({ error: 'No photo uploaded' });
        }

        const photoPath = `/uploads/profile-photos/${req.file.filename}`;

        const result = await query(
            `UPDATE users SET profile_photo = $1, updated_at = CURRENT_TIMESTAMP 
             WHERE id = $2 RETURNING *`,
            [photoPath, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            success: true,
            message: 'Profile photo uploaded successfully',
            photo_url: photoPath,
            user: result.rows[0]
        });

    } catch (error) {
        console.error('Error uploading photo:', error);
        res.status(500).json({ error: 'Failed to upload photo', message: error.message });
    }
});

// =====================================================
// FAVORITES ROUTES
// =====================================================

/**
 * GET /api/v1/users/:id/favorites
 * Get user's favorite stalls
 */
router.get('/:id/favorites', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT s.*, f.created_at as favorited_at,
                    (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE stall_id = s.id) as avg_rating,
                    (SELECT COUNT(*) FROM reviews WHERE stall_id = s.id) as review_count
             FROM favorites f
             JOIN stalls s ON f.stall_id = s.id
             WHERE f.user_id = $1
             ORDER BY f.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            favorites: result.rows
        });

    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Failed to fetch favorites', message: error.message });
    }
});

/**
 * POST /api/v1/users/:id/favorites/:stall_id
 * Add stall to favorites
 */
router.post('/:id/favorites/:stall_id', async (req, res) => {
    try {
        const { id, stall_id } = req.params;

        const result = await query(
            `INSERT INTO favorites (user_id, stall_id) 
             VALUES ($1, $2) 
             ON CONFLICT (user_id, stall_id) DO NOTHING
             RETURNING *`,
            [id, stall_id]
        );

        res.json({
            success: true,
            message: 'Stall added to favorites',
            favorite: result.rows[0]
        });

    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: 'Failed to add favorite', message: error.message });
    }
});

/**
 * DELETE /api/v1/users/:id/favorites/:stall_id
 * Remove stall from favorites
 */
router.delete('/:id/favorites/:stall_id', async (req, res) => {
    try {
        const { id, stall_id } = req.params;

        await query(
            `DELETE FROM favorites WHERE user_id = $1 AND stall_id = $2`,
            [id, stall_id]
        );

        res.json({
            success: true,
            message: 'Stall removed from favorites'
        });

    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: 'Failed to remove favorite', message: error.message });
    }
});

/**
 * GET /api/v1/users/:id/favorites/:stall_id/check
 * Check if stall is favorited
 */
router.get('/:id/favorites/:stall_id/check', async (req, res) => {
    try {
        const { id, stall_id } = req.params;

        const result = await query(
            `SELECT id FROM favorites WHERE user_id = $1 AND stall_id = $2`,
            [id, stall_id]
        );

        res.json({
            success: true,
            is_favorited: result.rows.length > 0
        });

    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ error: 'Failed to check favorite', message: error.message });
    }
});

// =====================================================
// REVIEWS ROUTES
// =====================================================

/**
 * GET /api/v1/users/:id/reviews
 * Get user's review history
 */
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT r.*, s.name as stall_name, s.cuisine_type
             FROM reviews r
             JOIN stalls s ON r.stall_id = s.id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            reviews: result.rows
        });

    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ error: 'Failed to fetch reviews', message: error.message });
    }
});

/**
 * PUT /api/v1/users/:id/reviews/:review_id
 * Edit a review
 */
router.put('/:id/reviews/:review_id', async (req, res) => {
    try {
        const { id, review_id } = req.params;
        const { rating, hygiene_score, comment, hygiene_responses } = req.body;

        // Verify ownership
        const ownerCheck = await query(
            `SELECT id FROM reviews WHERE id = $1 AND user_id = $2`,
            [review_id, id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to edit this review' });
        }

        const updates = [];
        const values = [];
        let paramCount = 0;

        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                return res.status(400).json({ error: 'Rating must be between 1 and 5' });
            }
            paramCount++;
            updates.push(`rating = $${paramCount}`);
            values.push(rating);
        }
        if (hygiene_score !== undefined) {
            if (hygiene_score < 1 || hygiene_score > 5) {
                return res.status(400).json({ error: 'Hygiene score must be between 1 and 5' });
            }
            paramCount++;
            updates.push(`hygiene_score = $${paramCount}`);
            values.push(hygiene_score);
        }
        if (comment !== undefined) {
            paramCount++;
            updates.push(`comment = $${paramCount}`);
            values.push(comment);
        }
        if (hygiene_responses !== undefined) {
            paramCount++;
            updates.push(`hygiene_responses = $${paramCount}`);
            values.push(JSON.stringify(hygiene_responses));
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');
        paramCount++;
        values.push(review_id);

        const result = await query(
            `UPDATE reviews SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
            values
        );

        res.json({
            success: true,
            message: 'Review updated successfully',
            review: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating review:', error);
        res.status(500).json({ error: 'Failed to update review', message: error.message });
    }
});

/**
 * DELETE /api/v1/users/:id/reviews/:review_id
 * Delete a review
 */
router.delete('/:id/reviews/:review_id', async (req, res) => {
    try {
        const { id, review_id } = req.params;

        // Verify ownership
        const ownerCheck = await query(
            `SELECT id FROM reviews WHERE id = $1 AND user_id = $2`,
            [review_id, id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({ error: 'Not authorized to delete this review' });
        }

        await query(`DELETE FROM reviews WHERE id = $1`, [review_id]);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        res.status(500).json({ error: 'Failed to delete review', message: error.message });
    }
});

// =====================================================
// NOTIFICATIONS ROUTES
// =====================================================

/**
 * GET /api/v1/users/:id/notifications
 * Get user's notifications
 */
router.get('/:id/notifications', async (req, res) => {
    try {
        const { id } = req.params;
        const { unread_only } = req.query;

        let sqlQuery = `SELECT * FROM notifications WHERE user_id = $1`;
        if (unread_only === 'true') {
            sqlQuery += ` AND read = false`;
        }
        sqlQuery += ` ORDER BY created_at DESC LIMIT 50`;

        const result = await query(sqlQuery, [id]);

        // Count unread
        const unreadResult = await query(
            `SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = $1 AND read = false`,
            [id]
        );

        res.json({
            success: true,
            unread_count: parseInt(unreadResult.rows[0].unread_count),
            notifications: result.rows
        });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ error: 'Failed to fetch notifications', message: error.message });
    }
});

/**
 * PUT /api/v1/users/:id/notifications/:notification_id/read
 * Mark notification as read
 */
router.put('/:id/notifications/:notification_id/read', async (req, res) => {
    try {
        const { id, notification_id } = req.params;

        await query(
            `UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2`,
            [notification_id, id]
        );

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('Error marking notification read:', error);
        res.status(500).json({ error: 'Failed to mark notification read', message: error.message });
    }
});

/**
 * PUT /api/v1/users/:id/notifications/read-all
 * Mark all notifications as read
 */
router.put('/:id/notifications/read-all', async (req, res) => {
    try {
        const { id } = req.params;

        await query(
            `UPDATE notifications SET read = true WHERE user_id = $1`,
            [id]
        );

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error('Error marking all notifications read:', error);
        res.status(500).json({ error: 'Failed to mark all notifications read', message: error.message });
    }
});

// =====================================================
// REPORTS/FEEDBACK ROUTES
// =====================================================

/**
 * POST /api/v1/reports
 * Submit a stall report or feedback
 */
router.post('/reports', async (req, res) => {
    try {
        const { user_id, stall_id, type, description } = req.body;

        if (!user_id || !type || !description) {
            return res.status(400).json({
                error: 'Missing required fields: user_id, type, description'
            });
        }

        const validTypes = ['incorrect_info', 'closed_permanently', 'hygiene_issue', 'new_stall_suggestion', 'other'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({
                error: `Invalid report type. Must be one of: ${validTypes.join(', ')}`
            });
        }

        const result = await query(
            `INSERT INTO reports (user_id, stall_id, type, description)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [user_id, stall_id || null, type, description]
        );

        res.status(201).json({
            success: true,
            message: 'Report submitted successfully. Thank you for your feedback!',
            report: result.rows[0]
        });

    } catch (error) {
        console.error('Error submitting report:', error);
        res.status(500).json({ error: 'Failed to submit report', message: error.message });
    }
});

/**
 * GET /api/v1/users/:id/reports
 * Get user's submitted reports
 */
router.get('/:id/reports', async (req, res) => {
    try {
        const { id } = req.params;

        const result = await query(
            `SELECT r.*, s.name as stall_name
             FROM reports r
             LEFT JOIN stalls s ON r.stall_id = s.id
             WHERE r.user_id = $1
             ORDER BY r.created_at DESC`,
            [id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            reports: result.rows
        });

    } catch (error) {
        console.error('Error fetching reports:', error);
        res.status(500).json({ error: 'Failed to fetch reports', message: error.message });
    }
});

module.exports = router;
