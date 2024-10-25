// Importação de dependências
const Email = require('../models/emailModel');
const validator = require('validator');
const dns = require('dns');
const whois = require('whois');
const { checkDomainExistenceWithSMTP } = require('../services/domainService'); 

/**
 * Verifica se um e-mail é válido.
 * @param {string} email - O e-mail a ser verificado.
 * @returns {Object} - Um objeto contendo o e-mail e a validade.
 * @throws {Error} - Se o formato do e-mail for inválido, se o domínio estiver na blacklist ou não existir.
 */
const verifyEmail = async (email) => {
  // Valida o formato do e-mail
  if (!validator.isEmail(email))
    throw new Error('Invalid e-mail format');

  const domain = email.split('@')[1];

  // Verifica se o domínio está na lista negra
  const blacklistedDomain = await Email.findOne({ email: new RegExp(`^${domain}$`, 'i'), isBlacklisted: true });
  if (blacklistedDomain) 
    throw new Error('Domain in blacklist or invalid');

  // Verifica se o domínio é confiável
  const trustedDomain = await Email.findOne({ email: new RegExp(`^${domain}$`, 'i'), isTrusted: true });
  if (trustedDomain)
    return { email, isValid: true };

  // Verifica a existência do domínio através do serviço centralizado
  const exists = await checkDomainExistenceWithSMTP(domain);
  if (!exists)
    throw new Error('Domain does not exist');

  return { email, isValid: true };
};

/**
 * Adiciona um e-mail à lista de e-mails confiáveis.
 * @param {string} email - O e-mail a ser adicionado.
 * @returns {Object} - O e-mail adicionado.
 * @throws {Error} - Se o formato do e-mail for inválido ou se já existir.
 */
const addTrustedEmail = async (email) => {
  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Verifica se o e-mail já existe
  const existingEmail = await Email.findOne({ email });
  if (existingEmail) {
    throw new Error('Email already exists');
  }

  // Cria e salva um novo e-mail
  const newEmail = new Email({ email, isBlacklisted: false });
  await newEmail.save();
  return newEmail;
};

/**
 * Adiciona um domínio à blacklist.
 * @param {string} domain - O domínio a ser adicionado.
 * @returns {Object} - O domínio adicionado.
 * @throws {Error} - Se o formato do domínio for inválido ou se já existir na blacklist.
 */
const addBlacklistedDomain = async (domain) => {
  // Valida o formato do domínio
  if (!validator.isFQDN(domain)) {
    throw new Error('Invalid domain format');
  }

  // Verifica se o domínio já está na blacklist
  const existingDomain = await Email.findOne({ email: domain, isBlacklisted: true });
  if (existingDomain) {
    throw new Error('Domain already blacklisted');
  }

  // Cria e guarda um novo domínio
  const newEmail = new Email({ email: domain, isBlacklisted: true });
  await newEmail.save();
  return newEmail;
};

/**
 * Obtém todos os e-mails guardados.
 * @returns {Array} - Lista de e-mails.
 */
const getAllEmails = async () => {
  return await Email.find();
};

/**
 * Atualiza um e-mail confiável existente.
 * @param {string} id - O ID do e-mail a ser atualizado.
 * @param {string} newEmail - O novo e-mail.
 * @returns {Object} - O e-mail atualizado.
 * @throws {Error} - Se o formato do novo e-mail for inválido ou se o e-mail não for encontrado.
 */
const updateTrustedEmail = async (id, newEmail) => {
  // Valida o formato do novo e-mail
  if (!validator.isEmail(newEmail)) {
    throw new Error('Invalid email format');
  }

  // Atualiza o e-mail
  const updatedEmail = await Email.findByIdAndUpdate(id, { email: newEmail }, { new: true });
  if (!updatedEmail) {
    throw new Error('Email not found');
  }

  return updatedEmail;
};

/**
 * Deleta um e-mail confiável existente.
 * @param {string} id - O ID do e-mail a ser eliminado.
 * @returns {Object} - Mensagem de confirmação da eliminação.
 * @throws {Error} - Se o e-mail não for encontrado.
 */
const deleteTrustedEmail = async (id) => {
  const deletedEmail = await Email.findByIdAndDelete(id);
  if (!deletedEmail) {
    throw new Error('Email not found');
  }

  return { message: 'Email deleted successfully' };
};

// Exporta as funções para uso em outras partes da aplicação
module.exports = {
  verifyEmail,
  addTrustedEmail,
  addBlacklistedDomain,
  getAllEmails,
  updateTrustedEmail,
  deleteTrustedEmail,
};
