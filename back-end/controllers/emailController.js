// Importação de dependências
const emailService = require('../services/emailService');
const { checkDomainExistenceWithSMTP } = require('../services/domainService');
const { getFirstEmailDate } = require('../services/gmailService'); 

/**
 * Verifica a validade de um e-mail.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const verifyEmail = async (req, res) => {
  const { email } = req.body; // Extrai o e-mail do corpo da requisição

  try {
    // Verifica o e-mail através do serviço
    const result = await emailService.verifyEmail(email);
    console.log('Email verification passed:', result.email);
    return res.json({ result: 'passed' });
  } catch (error) {
    console.error('Error verifying email:', error.message);

    // Trata erros específicos de verificação de domínio
    if (error.message === 'Domain is blacklisted or invalid') {
      return res.json({ result: 'failed', error: error.message });
    }

    if (error.message === 'Domain does not exist') {
      return res.json({ result: 'failed', error: error.message });
    }
    
    return res.status(400).json({ error: error.message }); 
  }
};

/**
 * Verifica a existência de um domínio através de WHOIS, MX e SMTP.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const verifyEmailDomain = async (req, res) => {
  const { email } = req.body;
  const domain = email.split('@')[1]; // Extrai o domínio do e-mail

  try {
    // Verifica se o domínio existe
    const domainExists = await checkDomainExistenceWithSMTP(domain);
    if (domainExists) {
      res.status(200).json({ result: 'Domain exists and is valid' }); // Domínio válido
    } else {
      res.status(400).json({ result: 'Invalid domain or SMTP failure' }); // Domínio inválido
    }
  } catch (error) {
    res.status(500).json({ result: 'Error verifying domain', error: error.message }); // Erro ao verificar domínio
  }
};

/**
 * Verifica a idade da conta de e-mail.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const verifyEmailAccountAge = async (req, res) => {
  const { email } = req.body;

  try {
    const firstEmailDate = await getFirstEmailDate(); // Obtém a data do primeiro e-mail
    if (firstEmailDate) {
      const accountAgeInDays = Math.floor((Date.now() - firstEmailDate) / (1000 * 60 * 60 * 24)); // Calcula a idade da conta
      res.status(200).json({ accountAgeInDays });
    } else {
      res.status(404).json({ message: 'No email found.' }); // Nenhum e-mail encontrado
    }
  } catch (error) {
    res.status(500).json({ error: 'Error verifying account age.' }); // Erro ao verificar a idade da conta
  }
};

/**
 * Adiciona um e-mail à lista de e-mails confiáveis.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const addTrustedEmail = async (req, res) => {
  const { email } = req.body; // Extrai o e-mail do corpo da requisição

  try {
    const newEmail = await emailService.addTrustedEmail(email); // Adiciona o e-mail através do serviço
    console.log('Trusted email added successfully:', newEmail);
    res.status(201).json({ message: 'Trusted email added successfully', email: newEmail }); 
  } catch (error) {
    console.error('Error adding trusted email:', error.message);
    res.status(409).json({ error: error.message });
  }
};

/**
 * Adiciona um domínio à blacklist.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const addBlacklistedDomain = async (req, res) => {
  const { domain } = req.body; // Extrai o domínio do corpo da requisição

  try {
    const newDomain = await emailService.addBlacklistedDomain(domain); // Adiciona o domínio através do serviço
    console.log('Domain added to blacklist successfully:', newDomain);
    res.status(201).json({ message: 'Domain added to blacklist successfully', domain: newDomain }); 
  } catch (error) {
    console.error('Error adding blacklisted domain:', error.message);
    res.status(409).json({ error: error.message });
  }
};

/**
 * Obtém todos os e-mails guardados.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const getAllEmails = async (req, res) => {
  try {
    const emails = await emailService.getAllEmails(); // Procura todos os e-mails através do serviço
    console.log('Fetched emails:', emails);
    res.json(emails); // Return da lista de e-mails
  } catch (error) {
    console.error('Error fetching emails:', error.message);
    res.status(500).json({ error: 'Error fetching emails' }); // Erro ao procurar e-mails
  }
};

/**
 * Atualiza um e-mail confiável existente.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const updateTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser atualizado
  const { email } = req.body; // Novo e-mail

  try {
    const updatedEmail = await emailService.updateTrustedEmail(id, email); // Atualiza o e-mail através do serviço
    res.json({ message: 'Email updated successfully', email: updatedEmail }); 
  } catch (error) {
    console.error('Error updating email:', error.message);
    res.status(400).json({ error: error.message }); // Return erro se falhar
  }
};

/**
 * Apaga um e-mail confiável existente.
 * @param {Object} req - O objeto da requisição.
 * @param {Object} res - O objeto da resposta.
 */
const deleteTrustedEmail = async (req, res) => {
  const { id } = req.params; // ID do e-mail a ser excluído

  try {
    const result = await emailService.deleteTrustedEmail(id); // Exclui o e-mail através do serviço
    res.json({ message: 'Email deleted successfully' }); 
  } catch (error) {
    console.error('Error deleting email:', error.message);
    res.status(404).json({ error: error.message }); // Return erro se falhar
  }
};

// Exporta os controladores para uso em outras partes da aplicação
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
