const mongoose = require('mongoose');

// Expressão regular para validação de e-mails
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true, // Garante que o e-mail seja único
    match: [emailRegex, 'Please fill a valid email address'], // Validação de formato
  },
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
});

// Criação do modelo
module.exports = mongoose.model('Email', emailSchema);
