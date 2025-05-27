const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post('/signin', authController.signIn);
router.post('/signin-with-token', authController.signInWithToken);

module.exports = router;
