require('dotenv').config(); // Carregar variáveis de ambiente
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const emailRoutes = require('./routes/emailRoutes'); // Importa as rotas de email

const app = express();
app.use(cors());

// Middleware para analisar JSON
app.use(express.json());

// Conectar à base de dados
connectDB(); // Chama a função para conectar ao MongoDB

// Usar rotas de email
app.use('/api/emails', emailRoutes); // Isso adiciona o prefixo /api/emails a todas as rotas definidas em emailRoutes

const PORT = process.env.PORT || 5000;

// Iniciar o servidor e tratar erros de conexão
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
