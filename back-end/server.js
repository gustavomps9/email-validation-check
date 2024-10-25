require('dotenv').config(); 
const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
const emailRoutes = require('./routes/emailRoutes'); 

const app = express();
app.use(cors());

app.use(express.json());

// Conexão à base de dados
connectDB(); // Chama a função para conectar ao MongoDB

// Usar rotas de email
app.use('/api/emails', emailRoutes); 

const PORT = process.env.PORT || 5000;

// Iniciar o servidor e tratar erros de conexão
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
