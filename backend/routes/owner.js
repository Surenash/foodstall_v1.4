const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { query } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/hygiene-photos/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'hygiene-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
        }
    }
});

const { authenticateToken } = require('../middleware/auth');

/**
 * POST /api/v1/owner/status
 * Update stall open/closed status and location
 * Body: { stall_id, owner_id, is_open, location: { lat, long } }
 */
router.post('/status', authenticateToken, [
    body('stall_id').isUUID().withMessage('Valid stall_id is required'),
    body('owner_id').isUUID().withMessage('Valid owner_id is required'),
    body('is_open').isBoolean().withMessage('is_open must be a boolean'),
    body('location').optional().isObject(),
    body('location.lat').optional().isFloat(),
    body('location.long').optional().isFloat(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { stall_id, owner_id, is_open, location } = req.body;

        // Verify ownership
        const ownerCheck = await query(
            'SELECT id FROM stalls WHERE id = $1 AND owner_id = $2',
            [stall_id, owner_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized to update this stall'
            });
        }

        // Build update query
        let updateQuery = 'UPDATE stalls SET is_open = $1, last_status_update = CURRENT_TIMESTAMP';
        let params = [is_open];
        let paramCount = 1;

        // Update location if provided (for mobile carts)
        if (location && location.lat && location.long) {
            updateQuery += `, location = ST_GeogFromText('POINT(' || $2::text || ' ' || $3::text || ')')`;
            params.push(location.long, location.lat);
            paramCount += 2;
        }

        updateQuery += ` WHERE id = $${paramCount + 1} RETURNING *`;
        params.push(stall_id);

        const result = await query(updateQuery, params);

        // Emit Socket.io event for real-time update (will be handled by server.js)
        if (req.app.get('io')) {
            req.app.get('io').emit('stall_status_update', {
                stall_id,
                is_open,
                last_status_update: result.rows[0].last_status_update,
            });

            // Also emit location update if provided, useful for PushCartRadar
            if (location && location.lat && location.long) {
                req.app.get('io').emit('stall_location_update', {
                    stall_id,
                    location: {
                        latitude: location.lat,
                        longitude: location.long
                    },
                    last_status_update: result.rows[0].last_status_update,
                });
            }
        }

        res.json({
            success: true,
            message: `Stall is now ${is_open ? 'OPEN' : 'CLOSED'}`,
            stall: result.rows[0],
        });

    } catch (error) {
        console.error('Error updating stall status:', error);
        res.status(500).json({
            error: 'Failed to update stall status',
            message: error.message
        });
    }
});

/**
 * PUT /api/v1/owner/menu
 * Update stall menu
 * Body: { stall_id, owner_id, menu_text }
 */
router.put('/menu', authenticateToken, [
    body('stall_id').isUUID().withMessage('Valid stall_id is required'),
    body('owner_id').isUUID().withMessage('Valid owner_id is required'),
    body('menu_text').isString().notEmpty().withMessage('menu_text is required').trim().escape()
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const { stall_id, owner_id, menu_text } = req.body;

        // Verify ownership
        const ownerCheck = await query(
            'SELECT id FROM stalls WHERE id = $1 AND owner_id = $2',
            [stall_id, owner_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized to update this stall'
            });
        }

        // Update menu
        const result = await query(
            `UPDATE stalls 
       SET menu_text = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [menu_text, stall_id]
        );

        res.json({
            success: true,
            message: 'Menu updated successfully',
            stall: result.rows[0],
        });

    } catch (error) {
        console.error('Error updating menu:', error);
        res.status(500).json({
            error: 'Failed to update menu',
            message: error.message
        });
    }
});

/**
 * POST /api/v1/owner/hygiene-proof
 * Upload hygiene certification or proof photos
 * Body: multipart/form-data with 'photo' field
 * Fields: stall_id, owner_id, photo_type (fssai|setup|other)
 */
router.post('/hygiene-proof', authenticateToken, upload.single('photo'), async (req, res) => {
    try {
        const { stall_id, owner_id, photo_type = 'other' } = req.body;

        if (!stall_id || !owner_id) {
            return res.status(400).json({
                error: 'Missing required fields: stall_id, owner_id'
            });
        }

        if (!req.file) {
            return res.status(400).json({
                error: 'No photo uploaded'
            });
        }

        // Verify ownership
        const ownerCheck = await query(
            'SELECT hygiene_badges FROM stalls WHERE id = $1 AND owner_id = $2',
            [stall_id, owner_id]
        );

        if (ownerCheck.rows.length === 0) {
            return res.status(403).json({
                error: 'Not authorized to update this stall'
            });
        }

        // Get current hygiene badges
        const currentBadges = ownerCheck.rows[0].hygiene_badges || {};

        // Add photo to hygiene_photos array
        if (!currentBadges.hygiene_photos) {
            currentBadges.hygiene_photos = [];
        }

        const photoData = {
            filename: req.file.filename,
            path: req.file.path,
            type: photo_type,
            uploaded_at: new Date().toISOString(),
        };

        currentBadges.hygiene_photos.push(photoData);

        // Mark as FSSAI verified if photo type is fssai
        // Normally, this should go to a moderation queue. Marking as pending for realism.
        if (photo_type === 'fssai') {
            currentBadges.fssai_verified = 'pending';
        }

        // Update database
        const result = await query(
            `UPDATE stalls 
       SET hygiene_badges = $1, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2 
       RETURNING *`,
            [JSON.stringify(currentBadges), stall_id]
        );

        res.json({
            success: true,
            message: 'Hygiene proof uploaded successfully',
            photo: photoData,
            stall: result.rows[0],
        });

    } catch (error) {
        console.error('Error uploading hygiene proof:', error);
        res.status(500).json({
            error: 'Failed to upload hygiene proof',
            message: error.message
        });
    }
});

/**
 * GET /api/v1/owner/stalls/:owner_id
 * Get all stalls owned by a specific owner
 */
router.get('/stalls/:owner_id', authenticateToken, async (req, res) => {
    try {
        const { owner_id } = req.params;

        const result = await query(
            `SELECT 
        s.*,
        ST_Y(s.location::geometry) as latitude,
        ST_X(s.location::geometry) as longitude,
        (SELECT COUNT(*) FROM reviews WHERE stall_id = s.id) as review_count,
        (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE stall_id = s.id) as avg_rating
      FROM stalls s
      WHERE s.owner_id = $1
      ORDER BY s.created_at DESC`,
            [owner_id]
        );

        res.json({
            success: true,
            count: result.rows.length,
            stalls: result.rows,
        });

    } catch (error) {
        console.error('Error fetching owner stalls:', error);
        res.status(500).json({
            error: 'Failed to fetch stalls',
            message: error.message
        });
    }
});

module.exports = router;
