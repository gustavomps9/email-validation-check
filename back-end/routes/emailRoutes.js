const express = require('express');
const { verifyEmail, addTrustedEmail, addBlacklistedDomain ,getAllEmails, updateTrustedEmail, deleteTrustedEmail } = require('../controllers/emailController');
const router = express.Router();

router.post('/verify', verifyEmail);
router.post('/trusted', addTrustedEmail);
router.post('/blacklist', addBlacklistedDomain);
router.get('/trusted', getAllEmails);
router.put('/trusted/:id', updateTrustedEmail); 
router.delete('/trusted/:id', deleteTrustedEmail); 



module.exports = router;
