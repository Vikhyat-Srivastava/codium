/**
 * Application-wide constants.
 * Import from here — never hard-code these values in business logic.
 */

const ROLES = Object.freeze({
  STUDENT: 'student',
  ADMIN:   'admin',
});

const SOCIETY_CATEGORIES = Object.freeze([
  'technical',
  'art',
  'cultural',
  'sports',
  'other',
]);

const PAGINATION = Object.freeze({
  DEFAULT_PAGE:  1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT:     50,
});

const SORT_OPTIONS = Object.freeze({
  LATEST:  '-createdAt',
  OLDEST:  'createdAt',
  NAME_AZ: 'name',
  NAME_ZA: '-name',
});

const RECOMMENDATION = Object.freeze({
  CATEGORY_MATCH_SCORE: 5,
  KEYWORD_MATCH_SCORE:  3,
});

module.exports = {
  ROLES,
  SOCIETY_CATEGORIES,
  PAGINATION,
  SORT_OPTIONS,
  RECOMMENDATION,
};
