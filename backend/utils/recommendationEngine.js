const { RECOMMENDATION } = require('../config/constants');

/**
 * Score a single society against a user's interests.
 *
 * Scoring rules:
 *   +5 for every interest that matches the society category
 *   +3 for every interest keyword found in name, description, or tags
 *
 * @param {object}   society   - Mongoose Society document
 * @param {string[]} interests - Array of user interest strings
 * @returns {number} Total score
 */
const scoreSociety = (society, interests) => {
  if (!interests || interests.length === 0) return 0;

  let score = 0;

  const interestLower = interests.map((i) => i.toLowerCase().trim());

  // ── Category match ────────────────────────────────────────────────────────
  if (interestLower.includes(society.category.toLowerCase())) {
    score += RECOMMENDATION.CATEGORY_MATCH_SCORE;
  }

  // ── Keyword match (name, description, tags) ───────────────────────────────
  const societyText = [
    society.name,
    society.description,
    ...(society.tags || []),
  ]
    .join(' ')
    .toLowerCase();

  interestLower.forEach((interest) => {
    if (societyText.includes(interest)) {
      score += RECOMMENDATION.KEYWORD_MATCH_SCORE;
    }
  });

  return score;
};

/**
 * Rank societies by relevance to the given interests.
 *
 * @param {object[]} societies - Array of Society documents
 * @param {string[]} interests - User interests
 * @returns {object[]} Sorted array with score attached (score > 0 only, unless none match)
 */
const rankSocieties = (societies, interests) => {
  const scored = societies.map((society) => {
    const plain = society.toObject ? society.toObject() : society;
    return {
      ...plain,
      score: scoreSociety(plain, interests),
    };
  });

  // Sort descending by score, then alphabetically by name for ties
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return a.name.localeCompare(b.name);
  });

  return scored;
};

module.exports = { rankSocieties, scoreSociety };
