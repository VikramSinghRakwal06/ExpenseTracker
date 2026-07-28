const express = require('express');
const rateLimit = require('express-rate-limit');
const {
  loginController,
  registerController,
  updateProfileController,
  updatePasswordController,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const {
  validate,
  registerRules,
  loginRules,
  updatePasswordRules,
} = require('../middleware/validators');

// router object
const router = express.Router();

// Throttle auth endpoints to slow down credential-stuffing / brute force attempts
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts, please try again later' },
});

// POST || LOGIN USER
router.post('/login', authLimiter, loginRules, validate, loginController);

// POST || REGISTER USER
router.post('/register', authLimiter, registerRules, validate, registerController);

// PATCH || UPDATE PROFILE (protected)
router.patch('/profile', authMiddleware, updateProfileController);

// PATCH || UPDATE PASSWORD (protected)
router.patch('/password', authMiddleware, updatePasswordRules, validate, updatePasswordController);

module.exports = router;
