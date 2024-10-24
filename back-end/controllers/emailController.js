const emailService = require('../services/emailService');
const { checkDomainExistenceWithSMTP } = require('../services/domainService');
const { getFirstEmailDate } = require('../services/gmailService'); 

const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica o e-mail
    const result = await emailService.verifyEmail(email);
    console.log('Email verification passed:', result.email);
    return res.json({ result: 'passed' });
  } catch (error) {
    console.error('Error verifying email:', error.message);

    if (error.message === 'Domain is blacklisted or invalid') {
      return res.json({ result: 'failed', error: error.message });
    }

    if (error.message === 'Domain does not exist') {
      return res.json({ result: 'failed', error: error.message });
    }
    
    return res.status(400).json({ error: error.message });
  }
};

const verifyEmailDomain = async (req, res) => {
  const { email } = req.body;
  const domain = email.split('@')[1]; // Extrai o domínio do e-mail

  try {
    // Verificar se o domínio existe através de WHOIS, MX e SMTP
    const domainExists = await checkDomainExistenceWithSMTP(domain);
    if (domainExists) {
      res.status(200).json({ result: 'Domain exists and is valid' });
    } else {
      res.status(400).json({ result: 'Invalid domain or SMTP failure' });
    }
  } catch (error) {
    res.status(500).json({ result: 'Error verifying domain', error: error.message });
  }
};

const verifyEmailAccountAge = async (req, res) => {
  const { email } = req.body;

  try {
    const firstEmailDate = await getFirstEmailDate(); // Obtém a data do primeiro email
    if (firstEmailDate) {
      const accountAgeInDays = Math.floor((Date.now() - firstEmailDate) / (1000 * 60 * 60 * 24));
      res.status(200).json({ accountAgeInDays });
    } else {
      res.status(404).json({ message: 'No email found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying account age.' });
  }
};

const addTrustedEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const newEmail = await emailService.addTrustedEmail(email);
    console.log('Trusted email added successfully:', newEmail);
    res.status(201).json({ message: 'Trusted email added successfully', email: newEmail });
  } catch (error) {
    console.error('Error adding trusted email:', error.message);
    res.status(409).json({ error: error.message });
  }
};

const addBlacklistedDomain = async (req, res) => {
  const { domain } = req.body;

  try {
    const newDomain = await emailService.addBlacklistedDomain(domain);
    console.log('Domain added to blacklist successfully:', newDomain);
    res.status(201).json({ message: 'Domain added to blacklist successfully', domain: newDomain });
  } catch (error) {
    console.error('Error adding blacklisted domain:', error.message);
    res.status(409).json({ error: error.message });
  }
};

const getAllEmails = async (req, res) => {
  try {
    const emails = await emailService.getAllEmails();
    console.log('Fetched emails:', emails);
    res.json(emails);
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    res.status(500).json({ error: 'Error fetching emails' });
  }
};

const updateTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser atualizado
  const { email } = req.body; // Novo e-mail

  try {
    const updatedEmail = await emailService.updateTrustedEmail(id, email);
    res.json({ message: 'Email updated successfully', email: updatedEmail });
  } catch (error) {
    console.error('Error updating email:', error.message);
    res.status(400).json({ error: error.message });
  }
};

const deleteTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser excluído

  try {
    const result = await emailService.deleteTrustedEmail(id);
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error.message);
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  verifyEmail,
  verifyEmailDomain,
  verifyEmailAccountAge,
  addTrustedEmail,
  addBlacklistedDomain,
  getAllEmails,
  updateTrustedEmail,
  deleteTrustedEmail,
};
