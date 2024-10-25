// Importação dos serviços necessários
const emailService = require('../services/emailService');
const { checkDomainExistenceWithSMTP } = require('../services/domainService');
const { getFirstEmailDate } = require('../services/gmailService');

/**
 * Função para verificar a validade de um e-mail.
 * @param {Object} req - O objeto de requisição que contém o e-mail.
 * @param {Object} res - O objeto de resposta para dar return do resultado.
 */
const verifyEmail = async (req, res) => {
  const { email } = req.body;

  try {
    // Verifica o e-mail utilizando o serviço de e-mail
    const result = await emailService.verifyEmail(email);
    console.log('Email verification passed:', result.email);
    return res.json({ result: 'passed' });
  } catch (error) {
    console.error('Error verifying email:', error.message);

    // Mensagens de erro para os domínios presentes na blacklist
    if (error.message === 'Domain is blacklisted or invalid') {
      return res.json({ result: 'failed', error: error.message });
    }

    // Mensagens de erro para os domínios que não existem
    if (error.message === 'Domain does not exist') {
      return res.json({ result: 'failed', error: error.message });
    }
    
    // Returm de um erro padrão caso nenhum dos erros anteriores se aplique
    return res.status(400).json({ error: error.message });
  }
};

/**
 * Função para verificar a existência de um domínio.
 * @param {Object} req - O objeto de requisição que contém o e-mail.
 * @param {Object} res - O objeto de resposta para dar return do resultado.
 */
const verifyEmailDomain = async (req, res) => {
  const { email } = req.body;
  const domain = email.split('@')[1]; // Extrai o domínio do e-mail

  try {
    // Verifica se o domínio existe através de WHOIS, MX e SMTP
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

/**
 * Função para verificar a idade da conta de e-mail com base na data do primeiro e-mail recebido.
 * @param {Object} req - O objeto de requisição.
 * @param {Object} res - O objeto de resposta para retornar a idade da conta.
 */
const verifyEmailAccountAge = async (req, res) => {
  const { email } = req.body;

  try {
    const firstEmailDate = await getFirstEmailDate();
    if (firstEmailDate) {
      // Cálculo da idade da conta em dias
      const accountAgeInDays = Math.floor((Date.now() - firstEmailDate) / (1000 * 60 * 60 * 24));
      res.status(200).json({ accountAgeInDays });
    } else {
      res.status(404).json({ message: 'No email found.' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying account age.' });
  }
};

/**
 * Função para adicionar um e-mail confiável à lista de e-mails confiáveis.
 * @param {Object} req - O objeto de requisição que contém o e-mail a ser adicionado.
 * @param {Object} res - O objeto de resposta para retornar o resultado da adição.
 */
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

/**
 * Função para adicionar um domínio à lista de blacklist.
 * @param {Object} req - O objeto de requisição que contém o domínio a ser adicionado.
 * @param {Object} res - O objeto de resposta para dar return do resultado da adição.
 */
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

/**
 * Função para obter todos os e-mails guardados.
 * @param {Object} req - O objeto de requisição.
 * @param {Object} res - O objeto de resposta para dar return de todos os e-mails.
 */
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

/**
 * Função para atualizar um e-mail confiável com um novo valor.
 * @param {Object} req - O objeto de requisição que contém o ID e o novo e-mail.
 * @param {Object} res - O objeto de resposta para retornar o resultado da atualização.
 */
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

/**
 * Função para eliminar um e-mail confiável pelo ID.
 * @param {Object} req - O objeto de requisição que contém o ID do e-mail a ser eliminado.
 * @param {Object} res - O objeto de resposta para dar return do resultado da exclusão.
 */
const deleteTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser eliminado

  try {
    const result = await emailService.deleteTrustedEmail(id);
    res.json({ message: 'Email deleted successfully' });
  } catch (error) {
    console.error('Error deleting email:', error.message);
    res.status(404).json({ error: error.message });
  }
};

// Exportação de todas as funções para serem utilizadas como controllers de rotas
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
