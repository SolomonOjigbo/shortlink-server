const { check } = require('express-validator');

exports.encodeUrlValidator = [
  check('longUrl')
    .isURL()
    .withMessage('Must be a valid URL')
    .notEmpty()
    .withMessage('URL is required')
];

exports.decodeUrlValidator = [
  check('shortUrl')
    .isURL()
    .withMessage('Must be a valid URL')
    .notEmpty()
    .withMessage('Short URL is required')
];