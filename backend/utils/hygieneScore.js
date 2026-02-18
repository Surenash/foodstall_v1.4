/**
 * Hygiene Score Calculation Utility
 * 
 * Calculates hygiene scores based on user-submitted tags and responses
 */

// Positive hygiene indicators with their point values
const POSITIVE_TAGS = {
    gloves_used: 10,
    clean_water: 10,
    fssai_visible: 15,
    covered_food: 8,
    clean_area: 7,
    hairnet_used: 5,
    mineral_water: 10,
    clean_utensils: 8,
    hand_sanitizer: 5,
    waste_disposal: 6,
};

// Negative hygiene indicators with their point deductions
const NEGATIVE_TAGS = {
    dirty_utensils: -10,
    no_water_filter: -8,
    uncovered_food: -8,
    dirty_area: -7,
    flies_present: -5,
    no_gloves: -8,
};

/**
 * Calculate hygiene score from review tags
 * @param {Array} tags - Array of hygiene tags from review
 * @returns {Number} Score between 0 and 100
 */
function calculateTagScore(tags) {
    if (!tags || tags.length === 0) return 0;

    let score = 50; // Base score

    tags.forEach(tag => {
        if (POSITIVE_TAGS[tag]) {
            score += POSITIVE_TAGS[tag];
        } else if (NEGATIVE_TAGS[tag]) {
            score += NEGATIVE_TAGS[tag];
        }
    });

    // Clamp score between 0 and 100
    return Math.max(0, Math.min(100, score));
}

/**
 * Calculate aggregated hygiene score for a stall
 * @param {Array} reviews - Array of review objects with hygiene_tags and hygiene_score
 * @returns {Object} { score: number (1-5), breakdown: object }
 */
function calculateAggregatedScore(reviews) {
    if (!reviews || reviews.length === 0) {
        return { score: 0, breakdown: { totalReviews: 0 } };
    }

    let totalScore = 0;
    let totalTagScore = 0;
    let positiveTagCount = 0;
    let negativeTagCount = 0;

    reviews.forEach(review => {
        // Add the hygiene score (1-5)
        totalScore += review.hygiene_score || 0;

        // Calculate tag score
        if (review.hygiene_tags) {
            const tagScore = calculateTagScore(review.hygiene_tags);
            totalTagScore += tagScore;

            // Count positive and negative tags
            review.hygiene_tags.forEach(tag => {
                if (POSITIVE_TAGS[tag]) positiveTagCount++;
                if (NEGATIVE_TAGS[tag]) negativeTagCount++;
            });
        }
    });

    const avgScore = totalScore / reviews.length;
    const avgTagScore = totalTagScore / reviews.length;

    // Weighted calculation:
    // 70% from user hygiene scores (1-5 scale)
    // 30% from tag analysis (converted to 1-5 scale)
    const tagScoreNormalized = (avgTagScore / 100) * 5;
    const finalScore = (avgScore * 0.7) + (tagScoreNormalized * 0.3);

    return {
        score: Math.round(finalScore * 10) / 10, // Round to 1 decimal
        breakdown: {
            totalReviews: reviews.length,
            avgUserScore: Math.round(avgScore * 10) / 10,
            avgTagScore: Math.round(avgTagScore),
            positiveTagCount,
            negativeTagCount,
        }
    };
}

/**
 * Convert hygiene responses to tags
 * @param {Object} responses - Hygiene question responses (true/false)
 * @returns {Array} Array of tag strings
 */
function responsesToTags(responses) {
    const tags = [];

    if (responses.vendor_wears_gloves === true) tags.push('gloves_used');
    if (responses.vendor_wears_gloves === false) tags.push('no_gloves');

    if (responses.filtered_water_visible === true) tags.push('clean_water');
    if (responses.filtered_water_visible === false) tags.push('no_water_filter');

    if (responses.clean_utensils === true) tags.push('clean_utensils');
    if (responses.clean_utensils === false) tags.push('dirty_utensils');

    if (responses.covered_food_storage === true) tags.push('covered_food');
    if (responses.covered_food_storage === false) tags.push('uncovered_food');

    return tags;
}

module.exports = {
    calculateTagScore,
    calculateAggregatedScore,
    responsesToTags,
    POSITIVE_TAGS,
    NEGATIVE_TAGS,
};
