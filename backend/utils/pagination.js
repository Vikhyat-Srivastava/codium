const { PAGINATION, SORT_OPTIONS } = require('../config/constants');

/**
 * Parses pagination & sorting params from query string.
 *
 * @param {object} query - req.query
 * @returns {{ page, limit, skip, sortField }}
 */
const parsePaginationQuery = (query) => {
  let page  = parseInt(query.page,  10) || PAGINATION.DEFAULT_PAGE;
  let limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;

  // Clamp
  if (page  < 1) page  = 1;
  if (limit < 1) limit = 1;
  if (limit > PAGINATION.MAX_LIMIT) limit = PAGINATION.MAX_LIMIT;

  const skip = (page - 1) * limit;

  // Sort
  const sortMap = {
    latest:  SORT_OPTIONS.LATEST,
    oldest:  SORT_OPTIONS.OLDEST,
    name:    SORT_OPTIONS.NAME_AZ,
    '-name': SORT_OPTIONS.NAME_ZA,
  };
  const sortField = sortMap[query.sort] || SORT_OPTIONS.LATEST;

  return { page, limit, skip, sortField };
};

module.exports = { parsePaginationQuery };
