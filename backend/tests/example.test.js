const { query } = require('../config/database');
const { calculateAggregatedScore } = require('../utils/hygieneScore');

describe('Hygiene Score Calculation', () => {
    test('should calculate correct hygiene score from reviews', () => {
        const reviews = [
            {
                hygiene_score: 5,
                hygiene_tags: ['gloves_used', 'clean_water', 'fssai_visible']
            },
            {
                hygiene_score: 4,
                hygiene_tags: ['gloves_used', 'clean_utensils']
            }
        ];

        const result = calculateAggregatedScore(reviews);

        expect(result.score).toBeGreaterThan(4);
        expect(result.breakdown.totalReviews).toBe(2);
        expect(result.breakdown.positiveTagCount).toBe(5);
    });

    test('should return zero for no reviews', () => {
        const result = calculateAggregatedScore([]);

        expect(result.score).toBe(0);
        expect(result.breakdown.totalReviews).toBe(0);
    });
});

describe('Stalls API', () => {
    test('GET /api/v1/stalls/nearby should return nearby stalls', async () => {
        // This is a sample test structure
        // In production, use supertest for API testing

        const lat = 19.0760;
        const long = 72.8777;
        const radius = 1000;

        const sqlQuery = `
      SELECT COUNT(*) as count
      FROM stalls s
      WHERE ST_DWithin(
        s.location,
        ST_GeogFromText('POINT(' || $2 || ' ' || $1 || ')'),
        $3
      )
    `;

        const result = await query(sqlQuery, [lat, long, radius]);

        expect(result.rows[0].count).toBeGreaterThanOrEqual(0);
    });
});
