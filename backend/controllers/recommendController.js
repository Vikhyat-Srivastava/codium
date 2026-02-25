const Society = require('../models/Society');
const { rankSocieties } = require('../utils/recommendationEngine');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @desc    Get personalised society recommendations based on interests
 * @route   POST /api/recommend
 * @access  Public (pass interests in body; logged-in users may omit if interests on profile)
 * @body    { interests: string[] }
 *
 * Scoring:
 *   Category match → +5 per match
 *   Keyword match  → +3 per keyword found in name/description/tags
 */
const getRecommendations = async (req, res, next) => {
  try {
    let interests = req.body.interests || [];

    // If authenticated, merge profile interests with request interests
    if (req.user && req.user.interests && req.user.interests.length > 0) {
      const combined = new Set([...req.user.interests, ...interests]);
      interests = Array.from(combined);
    }

    // Fetch all active societies
    const societies = await Society.find({ isActive: true })
      .populate('createdBy', 'name')
      .lean();

    // Rank using the scoring engine
    const ranked = rankSocieties(societies, interests);

    return sendSuccess(res, 200, 'Recommendations generated.', {
      interests,
      count:        ranked.length,
      societies:    ranked,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getRecommendations };
