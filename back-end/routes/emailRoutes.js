const express = require('express');
const { 
  verifyEmail, 
  addTrustedEmail, 
  addBlacklistedDomain,
  getAllEmails, 
  updateTrustedEmail, 
  deleteTrustedEmail 
} = require('../controllers/emailController');

const router = express.Router();

// Rota para verificar e-mails
router.post('/verify', verifyEmail);

// Rota para adicionar e-mails confiáveis
router.post('/trusted', addTrustedEmail);

// Rota para adicionar domínios à lista negra
router.post('/blacklist', addBlacklistedDomain);

// Rota para obter todos os e-mails confiáveis
router.get('/trusted', getAllEmails);

// Rota para atualizar um e-mail confiável
router.put('/trusted/:id', updateTrustedEmail);

// Rota para deletar um e-mail confiável
router.delete('/trusted/:id', deleteTrustedEmail);

module.exports = router;
