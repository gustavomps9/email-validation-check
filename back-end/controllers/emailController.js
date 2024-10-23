const Email = require('../models/emailModel');
const googleAuth = require('../googleAuth/googleAuth');
const { getGmailAccountFromCode } = require('../googleAuth/googleAuth.js');
const validator = require('validator');

const verifyEmail = async (req, res) => {
  console.log('Confirming email:', req.body);
  const { email } = req.body;

  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    console.log('Invalid email format:', email); // Log para formato inválido
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Extrai o domínio do email
  const domain = email.split('@')[1];
  console.log('Extracted domain:', domain); // Log para o domínio extraído

  // Se for um email do Gmail, verifica a idade da conta
  if (domain === 'gmail.com') {
    try {
      const { emailDate } = await getGmailAccountFromCode(req.query.code); // Ajuste conforme necessário
      console.log('Gmail account date:', emailDate); // Log para a data da conta

      // Verifica se o email é muito recente (menos de 1 dia)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Subtrai 1 dia à data atual

      if (emailDate > oneDayAgo) {
        console.log('Account too new (less than 1 day)'); // Log para conta recente
        return res.json({ result: 'failed', reason: 'Account too new (less than 1 day)' });
      }
    } catch (error) {
      console.error('Error verifying Gmail account:', error); // Log de erro
      return res.status(500).json({ error: 'Failed to verify account age' });
    }
  }

  // Lista de domínios a serem rejeitados
  const blacklistedDomains = [
    'tokobeken.xyz', 'coredp.com', 'infolinkai.com',
    'acaciaa.top', 'gudri.com', 'kimgmail.com', 'kenvanharen.com',
    'cayxupro5.com', 'healthbeautynatural.site', 'boranora.com',
    'habosurechinhhangvietnam.online', 'cloneads.top',
    'denxsu.net', 'chupanhcuoidep.vn', 'polakim.cfd'
  ];

  // Lista de domínios confiáveis
  const trustedDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 
    'ua.pt', 'sapo.pt', 'blockbastards.io'
  ];

  // Verifica se o domínio está na lista negra
  const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
  if (blacklistedDomain || blacklistedDomains.includes(domain)) {
    console.log('Blacklisted or invalid domain found:', domain); // Log para domínio na lista negra
    return res.json({ result: 'failed', reason: 'Domain is blacklisted or invalid' });
  }

  // Verifica se o domínio é confiável
  if (!trustedDomains.includes(domain)) {
    console.log('Domain not trusted:', domain); // Log para domínio não confiável
    return res.json({ result: 'failed', reason: 'Domain is not trusted' });
  }

  // Se passar nas verificações
  console.log('Email verification passed:', email);
  return res.json({ result: 'passed' });
};

// Função para adicionar um e-mail confiável
const addTrustedEmail = async (req, res) => {
  const { email } = req.body;

  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    console.log('Invalid email format for trusted email:', email); // Log para formato inválido
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Verifica se o e-mail já existe
  const existingEmail = await Email.findOne({ email });
  if (existingEmail) {
    console.log('Email already exists:', email); // Log para email existente
    return res.status(409).json({ error: 'Email already exists' });
  }

  const newEmail = new Email({ email, isBlacklisted: false });
  try {
    await newEmail.save();
    console.log('Trusted email added successfully:', newEmail); // Log para sucesso
    res.status(201).json(newEmail);
  } catch (error) {
    console.error('Error saving trusted email:', error); // Log de erro
    res.status(500).json({ error: 'Error saving trusted email' });
  }
};

// Função para adicionar um domínio à lista negra
const addBlacklistedDomain = async (req, res) => {
  const { domain } = req.body;

  // Valida o formato do domínio
  if (!validator.isFQDN(domain)) {
    console.log('Invalid domain format:', domain); // Log para formato inválido
    return res.status(400).json({ error: 'Invalid domain format' });
  }

  // Verifica se o domínio já está na lista negra
  const existingDomain = await Email.findOne({ email: domain, isBlacklisted: true });
  if (existingDomain) {
    console.log('Domain already blacklisted:', domain); // Log para domínio existente
    return res.status(409).json({ error: 'Domain already blacklisted' });
  }

  const newEmail = new Email({ email: domain, isBlacklisted: true });
  try {
    await newEmail.save();
    console.log('Domain added to blacklist successfully:', newEmail); // Log para sucesso
    res.status(201).json(newEmail);
  } catch (error) {
    console.error('Error saving blacklisted domain:', error); // Log de erro
    res.status(500).json({ error: 'Error saving blacklisted domain' });
  }
};

// Função para listar todos os e-mails
const getAllEmails = async (req, res) => {
  try {
    const emails = await Email.find();
    console.log('Fetched emails:', emails); // Log para emails recuperados
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error); // Log de erro
    res.status(500).json({ error: 'Error fetching emails' });
  }
};

// Função para atualizar um e-mail confiável
const updateTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser atualizado
  const { email } = req.body; // Novo e-mail

  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
  }

  try {
      const updatedEmail = await Email.findByIdAndUpdate(id, { email }, { new: true });
      if (!updatedEmail) {
          return res.status(404).json({ error: 'Email not found' });
      }
      res.json(updatedEmail);
  } catch (error) {
      res.status(500).json({ error: 'Error updating email' });
  }
};

// Função para deletar um e-mail confiável
const deleteTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser excluído

  try {
      const deletedEmail = await Email.findByIdAndDelete(id);
      if (!deletedEmail) {
          return res.status(404).json({ error: 'Email not found' });
      }
      res.json({ message: 'Email deleted successfully' });
  } catch (error) {
      res.status(500).json({ error: 'Error deleting email' });
  }
};

// Exporta todas as funções do controlador
module.exports = {
  verifyEmail,
  addTrustedEmail,
  addBlacklistedDomain,
  getAllEmails,
  updateTrustedEmail,
  deleteTrustedEmail,
};
