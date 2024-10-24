const Email = require('../models/emailModel');
const validator = require('validator');
const dns = require('dns');
const whois = require('whois');

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
              resolve(true); // O domínio existe e tem registos MX
            }
          });
        } else {
          resolve(false);
        }
      }
    });
  });
};


const verifyEmail = async (email) => {
  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

 // Extrai o domínio do email
 const domain = email.split('@')[1];

 // Verificar se o domínio está na blacklist
 const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
 if (blacklistedDomain) {
   throw new Error('Domain is blacklisted or invalid');
 }

 const trustedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isTrusted: true });
 if (trustedDomain) {
   return { email, isValid: true }; // Retorna como válido se estiver na lista confiável
 }

 // Se o domínio não estiver na blacklist nem na lista confiável, verificar se existe
 const exists = await checkDomainExistence(domain);
 if (!exists) {
   throw new Error('Domain does not exist');
 }

 return { email, isValid: true };
};
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

const addBlacklistedDomain = async (domain) => {
  // Valida o formato do domínio
  if (!validator.isFQDN(domain)) {
    throw new Error('Invalid domain format');
  }

  // Verifica se o domínio já está na lista negra
  const existingDomain = await Email.findOne({ email: domain, isBlacklisted: true });
  if (existingDomain) {
    throw new Error('Domain already blacklisted');
  }

  const newEmail = new Email({ email: domain, isBlacklisted: true });
  await newEmail.save();
  return newEmail;
};

const getAllEmails = async () => {
  return await Email.find();
};

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

const deleteTrustedEmail = async (id) => {
  const deletedEmail = await Email.findByIdAndDelete(id);
  if (!deletedEmail) {
    throw new Error('Email not found');
  }

  return { message: 'Email deleted successfully' };
};

module.exports = {
  verifyEmail,
  addTrustedEmail,
  addBlacklistedDomain,
  getAllEmails,
  updateTrustedEmail,
  deleteTrustedEmail,
};