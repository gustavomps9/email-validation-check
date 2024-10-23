const mongoose = require('mongoose');

const emailSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function(v) {
        // Regex para validar apenas domínios
        return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
      },
      message: props => `${props.value} não é um domínio válido!`
    }
  },
  isBlacklisted: {
    type: Boolean,
    required: true,
    default: false,
  }
});

// Criação do modelo
module.exports = mongoose.model('Email', emailSchema);
