const Email = require('../models/emailModel'); // Modelo de Email
const validator = require('validator'); // Para validação de e-mails
const dns = require('dns'); // Para resolver domínios
const whois = require('whois'); // Para realizar consultas WHOIS

/**
 * Verifica a existência de um domínio utilizando consultas WHOIS e registros MX.
 * 
 * @param {string} domain - O domínio a ser verificado.
 * @returns {Promise<boolean>} 
 * @throws {Error} - Lança um erro se a consulta WHOIS falhar.
 */
const checkDomainExistence = async (domain) => {
  return new Promise((resolve, reject) => {
    // Verificar com WHOIS
    whois.lookup(domain, (err, data) => {
      if (err) {
        reject(new Error('WHOIS lookup failed'));
      } else {
        // Se houver dados do domínio
        if (data && data.includes('Domain Name:')) {
          const creationDateMatch = data.match(/Creation Date: (.+)/); // ou Registered On, dependendo do formato
          if (creationDateMatch) {
            const creationDate = new Date(creationDateMatch[1]);
            const currentDate = new Date();
            const domainAgeInDays = (currentDate - creationDate) / (1000 * 60 * 60 * 24);
            
            // Se o domínio foi criado nos últimos 30 dias, falha
            if (domainAgeInDays < 30) {
              resolve(false);
            }
          }

          // Verificar registros MX
          dns.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
              resolve(false); // Não existem registros MX
            } else {
              resolve(true); // O domínio existe e tem registros MX
            }
          });
        } else {
          resolve(false);
        }
      }
    });
  });
};

/**
 * Verifica a validade de um e-mail, checando se está na blacklist ou na lista de domínios confiáveis
 * 
 * @param {string} email - O e-mail a ser verificado.
 * @returns {Promise<Object>} - Retorna um objeto contendo o e-mail e um booleano indicando se é válido.
 * @throws {Error} - Lança um erro se o formato do e-mail for inválido, se o domínio estiver na blacklist ou se o domínio não existir.
 */
const verifyEmail = async (email) => {
  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Extrai o domínio do e-mail
  const domain = email.split('@')[1];

  // Verifica se o domínio está na blacklist
  const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
  if (blacklistedDomain) {
    throw new Error('Domain is blacklisted or invalid');
  }

  const trustedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isTrusted: true });
  if (trustedDomain) {
    return { email, isValid: true }; // Retorna como válido se estiver na lista de domínios confiáveis
  }

  // Se o domínio não estiver na blacklist nem na lista de domínios confiáveis, verificar se existe
  const exists = await checkDomainExistence(domain);
  if (!exists) {
    throw new Error('Domain does not exist');
  }

  return { email, isValid: true };
};

/**
 * Adiciona um e-mail à lista de domínios confiáveis.
 * 
 * @param {string} email - O e-mail a ser adicionado à lista de domínios confiáveis.
 * @returns {Promise<Object>} - Retorna o e-mail recém-adicionado.
 * @throws {Error} - Lança um erro se o formato do e-mail for inválido ou se o e-mail já existir.
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

  const newEmail = new Email({ email, isBlacklisted: false });
  await newEmail.save();
  return newEmail;
};

/**
 * Adiciona um domínio à blacklist.
 * 
 * @param {string} domain - O domínio a ser adicionado à blacklist.
 * @returns {Promise<Object>} - Retorna o domínio recém-adicionado à blacklist.
 * @throws {Error} - Lança um erro se o formato do domínio for inválido ou se o domínio já estiver na blacklist.
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

  const newEmail = new Email({ email: domain, isBlacklisted: true });
  await newEmail.save();
  return newEmail;
};

/**
 * Obtém todos os e-mails guardados na base de dados.
 * 
 * @returns {Promise<Array>} 
 */
const getAllEmails = async () => {
  return await Email.find();
};

/**
 * Atualiza um e-mail confiável existente.
 * 
 * @param {string} id - O ID do e-mail a ser atualizado.
 * @param {string} newEmail - O novo e-mail a ser definido.
 * @returns {Promise<Object>} - Return do e-mail atualizado.
 * @throws {Error} - Lança um erro se o formato do novo e-mail for inválido ou se o e-mail não for encontrado.
 */
const updateTrustedEmail = async (id, newEmail) => {
  if (!validator.isEmail(newEmail)) {
    throw new Error('Invalid email format');
  }

  const updatedEmail = await Email.findByIdAndUpdate(id, { email: newEmail }, { new: true });
  if (!updatedEmail) {
    throw new Error('Email not found');
  }

  return updatedEmail;
};

/**
 * Elimina um e-mail confiável existente.
 * 
 * @param {string} id - O ID do e-mail a ser eliminado.
 * @returns {Promise<Object>} - Return de uma mensagem de sucesso.
 * @throws {Error} - Lança um erro se o e-mail não for encontrado.
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
