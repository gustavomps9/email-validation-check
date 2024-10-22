const Email = require('../models/emailModel');
const { getGmailAccountFromCode } = require('../googleAuth');
const validator = require('validator');

// Função para verificar e-mails
const verifyEmail = async (req, res) => {
  const { email, code } = req.body;
  const domain = email.split('@')[1];

  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Verifica se o domínio está na lista negra
  const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
  if (blacklistedDomain) {
    return res.json({ result: 'failed' });
  }

  // Se for um email do Gmail, verifica a idade da conta
  if (domain === 'gmail.com') {
    try {
      const { emailDate } = await getGmailAccountFromCode(code);

      // Verifica se o email é muito recente (menos de 1 dia)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Subtrai 1 dia à data atual

      if (emailDate > oneDayAgo) {
        return res.json({ result: 'failed', reason: 'Account too new (less than 1 day)' });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Failed to verify account age' });
    }
  }

  // Se passar nas verificações
  return res.json({ result: 'passed' });
};

// Função para adicionar um e-mail confiável
const addTrustedEmail = async (req, res) => {
  const { email } = req.body;

  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Verifica se o e-mail já existe
  const existingEmail = await Email.findOne({ email });
  if (existingEmail) {
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newEmail = new Email({ email, isBlacklisted: false });
  try {
    await newEmail.save();
    res.status(201).json(newEmail);
  } catch (error) {
    res.status(500).json({ error: 'Error saving trusted email' });
  }
};

// Função para adicionar um domínio à lista negra
const addBlacklistedDomain = async (req, res) => {
  const { domain } = req.body;

  // Valida o formato do domínio
  if (!validator.isFQDN(domain)) {
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  // Verifica se o domínio já está na lista negra
  const existingDomain = await Email.findOne({ email: domain, isBlacklisted: true });
  if (existingDomain) {
    return res.status(409).json({ error: 'Domain already blacklisted' });
  }

  const newEmail = new Email({ email: domain, isBlacklisted: true });
  try {
    await newEmail.save();
    res.status(201).json(newEmail);
  } catch (error) {
    res.status(500).json({ error: 'Error saving blacklisted domain' });
  }
};

// Função para listar todos os e-mails
const getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find();
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching emails' });
  }
};

module.exports = { verifyEmail, addTrustedEmail, addBlacklistedDomain, getAllEmails };
