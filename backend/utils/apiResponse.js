/**
 * Centralised API response formatter.
 * All responses follow the shape:
 *   { success, message, data, meta }
 */

/**
 * Send a successful response.
 * @param {object} res      - Express response object
 * @param {number} status   - HTTP status code (default 200)
 * @param {string} message  - Human-readable success message
 * @param {*}      data     - Response payload
 * @param {object} meta     - Optional metadata (pagination, etc.)
 */
const sendSuccess = (res, status = 200, message = 'Success', data = null, meta = null) => {
  const payload = { success: true, message };
  if (data !== null) payload.data = data;
  if (meta !== null) payload.meta = meta;
  return res.status(status).json(payload);
};

/**
 * Send an error response.
 * @param {object} res     - Express response object
 * @param {number} status  - HTTP status code (default 500)
 * @param {string} message - Human-readable error message
 * @param {*}      errors  - Optional validation errors or details
 */
const sendError = (res, status = 500, message = 'Server error', errors = null) => {
  const payload = { success: false, message };
  if (errors !== null) payload.errors = errors;
  return res.status(status).json(payload);
};

/**
 * Build pagination metadata.
 * @param {number} total   - Total documents matching query
 * @param {number} page    - Current page
 * @param {number} limit   - Page size
 */
const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit),
  hasNext:    page < Math.ceil(total / limit),
  hasPrev:    page > 1,
});

module.exports = { sendSuccess, sendError, buildPaginationMeta };
