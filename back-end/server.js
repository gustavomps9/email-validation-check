const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./config/db');
const emailRoutes = require('./routes/emailRoutes'); // Importa as rotas de email

dotenv.config();

const app = express();
app.use(cors());

// Conectar à base de dados
connectDB();

// Middleware para analisar JSON
app.use(express.json());

// Usar rotas de email
app.use('/api/emails', emailRoutes); // Isso adiciona o prefixo /api/emails a todas as rotas definidas em emailRoutes

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
