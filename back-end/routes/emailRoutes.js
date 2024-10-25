const express = require('express');
const { 
  verifyEmail, 
  verifyEmailDomain,
  verifyEmailAccountAge, 
  addTrustedEmail,
  addBlacklistedDomain,
  getAllEmails, 
  updateTrustedEmail, 
  deleteTrustedEmail
} = require('../controllers/emailController');

const router = express.Router();

// Rota para verificar e-mails
router.post('/verify', verifyEmail);

// Rota para verificar domínios de e-mail
router.post('/verify-domain', verifyEmailDomain);

// Rota para verificar a idade da conta de e-mail(gmail)
router.get('/account-age', verifyEmailAccountAge);

// Rota para adicionar e-mails confiáveis
router.post('/trusted', addTrustedEmail);

// Rota para adicionar domínios à lista negra
router.post('/blacklist', addBlacklistedDomain);

// Rota para obter todos os e-mails confiáveis
router.get('/emails', getAllEmails);

// Rota para atualizar um e-mail confiável
router.put('/trusted/:id', updateTrustedEmail);

// Rota para eliminar um e-mail confiável
router.delete('/trusted/:id', deleteTrustedEmail);

module.exports = router;
