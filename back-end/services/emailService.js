// services/emailService.js
const Email = require('../models/emailModel');
const validator = require('validator');

const verifyEmail = async (email) => {
  // Valida o formato do e-mail
  if (!validator.isEmail(email)) {
    throw new Error('Invalid email format');
  }

  // Extrai o domínio do email
  const domain = email.split('@')[1];

  // Verifica se o domínio está na lista negra
  const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
  if (blacklistedDomain) {
    throw new Error('Domain is blacklisted or invalid');
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
