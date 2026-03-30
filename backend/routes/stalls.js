const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const { calculateAggregatedScore, responsesToTags } = require('../utils/hygieneScore');
const { body, validationResult } = require('express-validator');

/**
 * GET /api/v1/stalls/nearby
 * Find stalls near a specific location using PostGIS
 * Query params: lat, long, radius (in meters, default 1000)
 */
router.get('/nearby', async (req, res) => {
    try {
        const { lat, long, radius = 1000, open_only = 'false' } = req.query;

        if (!lat || !long) {
            return res.status(400).json({
                error: 'Latitude and longitude are required'
            });
        }

        // Validate coordinates
        const latitude = parseFloat(lat);
        const longitude = parseFloat(long);
        const searchRadius = parseInt(radius);

        if (isNaN(latitude) || isNaN(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return res.status(400).json({
                error: 'Invalid coordinates'
            });
        }

        const { cuisine, status, rating } = req.query;

        // Build query using PostGIS ST_DWithin and ST_Distance for accurate geospatial queries
        let sqlQuery = `
      SELECT 
        s.id,
        s.name,
        s.cuisine_type,
        s.description,
        s.is_open,
        s.last_status_update,
        s.price_range,
        s.dietary_tags,
        s.hygiene_badges,
        ST_Y(s.location::geometry) as latitude,
        ST_X(s.location::geometry) as longitude,
        ST_Distance(s.location, ST_GeogFromText('POINT(' || $1 || ' ' || $2 || ')')) as distance_meters,
        (
          SELECT COUNT(*) 
          FROM reviews r 
          WHERE r.stall_id = s.id
        ) as review_count,
        (
          SELECT COALESCE(AVG(r.rating), 0)
          FROM reviews r
          WHERE r.stall_id = s.id
        ) as avg_rating
      FROM stalls s
      WHERE ST_DWithin(s.location, ST_GeogFromText('POINT(' || $1 || ' ' || $2 || ')'), $3)
    `;

        const queryParams = [longitude, latitude, searchRadius];
        let paramCount = 3;

        // Filter by open status if requested
        if (open_only === 'true' || status === 'Open') {
            sqlQuery += ` AND s.is_open = true`;
        } else if (status === 'Closed') {
            sqlQuery += ` AND s.is_open = false`;
        }

        // Filter by cuisine
        if (cuisine && cuisine !== 'All') {
            paramCount++;
            sqlQuery += ` AND s.cuisine_type = $${paramCount}`;
            queryParams.push(cuisine);
        }

        sqlQuery += ' ORDER BY distance_meters ASC LIMIT 50';

        const result = await query(sqlQuery, queryParams);

        // Calculate hygiene scores for each stall
        const stallsWithHygiene = await Promise.all(
            result.rows.map(async (stall) => {
                const reviewsResult = await query(
                    'SELECT hygiene_score, hygiene_tags FROM reviews WHERE stall_id = $1',
                    [stall.id]
                );

                const hygieneData = calculateAggregatedScore(reviewsResult.rows);

                return {
                    ...stall,
                    distance_km: (stall.distance_meters / 1000).toFixed(2),
                    hygiene_score: hygieneData.score,
                    avg_rating: parseFloat(stall.avg_rating).toFixed(1),
                };
            })
        );

        // Filter by rating if requested (done post-query since it relies on subquery results)
        let filteredStalls = stallsWithHygiene;
        if (rating && !isNaN(parseFloat(rating))) {
             const minRating = parseFloat(rating);
             filteredStalls = stallsWithHygiene.filter(stall => parseFloat(stall.avg_rating) >= minRating);
        }

        res.json({
            success: true,
            count: filteredStalls.length,
            stalls: filteredStalls,
        });

    } catch (error) {
        console.error('Error fetching nearby stalls:', error);
        res.status(500).json({
            error: 'Failed to fetch nearby stalls',
            message: error.message
        });
    }
});

/**
 * GET /api/v1/stalls/:id/reviews
 * Get reviews for a specific stall with pagination
 */
router.get('/:id/reviews', async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const offset = (page - 1) * limit;

        const result = await query(
            `SELECT
                r.*,
                u.name as reviewer_name,
                u.profile_photo as reviewer_photo
             FROM reviews r
             JOIN users u ON r.user_id = u.id
             WHERE r.stall_id = $1
             ORDER BY r.created_at DESC
             LIMIT $2 OFFSET $3`,
            [id, limit, offset]
        );

        const countResult = await query(
            `SELECT COUNT(*) FROM reviews WHERE stall_id = $1`,
            [id]
        );
        const total = parseInt(countResult.rows[0].count);

        res.json({
            success: true,
            count: result.rows.length,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / limit),
            reviews: result.rows
        });

    } catch (error) {
        console.error('Error fetching stall reviews:', error);
        res.status(500).json({
            error: 'Failed to fetch stall reviews',
            message: error.message
        });
    }
});

/**
 * GET /api/v1/stalls/:id
 * Get detailed information about a specific stall
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Fetch stall details
        const stallResult = await query(
            `SELECT 
        s.*,
        u.name as owner_name,
        u.phone_number as owner_phone
      FROM stalls s
      JOIN users u ON s.owner_id = u.id
      WHERE s.id = $1`,
            [id]
        );

        if (stallResult.rows.length === 0) {
            return res.status(404).json({ error: 'Stall not found' });
        }

        const stall = stallResult.rows[0];

        // Fetch reviews with hygiene data
        const reviewsResult = await query(
            `SELECT 
        r.*,
        u.name as reviewer_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.stall_id = $1
      ORDER BY r.created_at DESC`,
            [id]
        );

        // Calculate hygiene score
        const hygieneData = calculateAggregatedScore(reviewsResult.rows);

        // Calculate average rating
        const avgRating = reviewsResult.rows.length > 0
            ? reviewsResult.rows.reduce((sum, r) => sum + r.rating, 0) / reviewsResult.rows.length
            : 0;

        res.json({
            success: true,
            stall: {
                ...stall,
                avg_rating: avgRating.toFixed(1),
                hygiene_score: hygieneData.score,
                hygiene_breakdown: hygieneData.breakdown,
                review_count: reviewsResult.rows.length,
            },
            reviews: reviewsResult.rows,
        });

    } catch (error) {
        console.error('Error fetching stall details:', error);
        res.status(500).json({
            error: 'Failed to fetch stall details',
            message: error.message
        });
    }
});

/**
 * POST /api/v1/reviews
 * Submit a review for a stall
 * Body: { stall_id, user_id, rating, hygiene_score, hygiene_responses, comment }
 */
router.post('/reviews', [
    body('stall_id').isUUID().withMessage('Valid stall_id is required'),
    body('user_id').isUUID().withMessage('Valid user_id is required'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('hygiene_score').isInt({ min: 1, max: 5 }).withMessage('Hygiene score must be between 1 and 5'),
    body('comment').optional().isString().trim().escape(),
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', details: errors.array() });
        }

        const {
            stall_id,
            user_id,
            rating,
            hygiene_score,
            hygiene_responses,
            comment
        } = req.body;

        // Convert hygiene responses to tags
        const hygieneTags = responsesToTags(hygiene_responses || {});

        // Insert review
        const result = await query(
            `INSERT INTO reviews (
        stall_id, user_id, rating, hygiene_score, 
        hygiene_tags, hygiene_responses, comment
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
            [
                stall_id,
                user_id,
                rating,
                hygiene_score,
                JSON.stringify(hygieneTags),
                JSON.stringify(hygiene_responses),
                comment || null
            ]
        );

        res.status(201).json({
            success: true,
            review: result.rows[0],
            message: 'Review submitted successfully'
        });

    } catch (error) {
        console.error('Error submitting review:', error);

        // Handle duplicate review error
        if (error.code === '23505') {
            return res.status(409).json({
                error: 'You have already reviewed this stall'
            });
        }

        res.status(500).json({
            error: 'Failed to submit review',
            message: error.message
        });
    }
});


/**
 * GET /api/v1/stalls/collections/featured
 * Get featured collections of stalls
 */
router.get('/collections/featured', async (req, res) => {
    try {
        // Fetch top rated open stalls
        const topRatedResult = await query(`
            SELECT s.name
            FROM stalls s
            WHERE s.is_open = true
            ORDER BY (SELECT COALESCE(AVG(rating), 0) FROM reviews WHERE stall_id = s.id) DESC
            LIMIT 5
        `);

        const topRatedNames = topRatedResult.rows.map(r => r.name);

        const collections = [
            {
                title: "Top Rated Open Now",
                description: "The highest rated food stalls currently open.",
                stallNames: topRatedNames
            }
        ];

        res.json({
            success: true,
            collections
        });
    } catch (error) {
        console.error('Error fetching featured collections:', error);
        res.status(500).json({
            error: 'Failed to fetch featured collections',
            message: error.message
        });
    }
});

module.exports = router;
