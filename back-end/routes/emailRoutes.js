const express = require('express');
const { verifyEmail, addTrustedEmail, getAllEmails } = require('../controllers/emailController');
const router = express.Router();

router.post('/verify', verifyEmail);
router.post('/trusted', addTrustedEmail);
router.get('/trusted', getAllEmails);
router.post('/blacklist', addBlacklistedDomain);

module.exports = router;
