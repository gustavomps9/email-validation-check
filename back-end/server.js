const express = require('express');
const { connectDB } = require('./config/db');
const emailRoutes = require('./routes/emailRoutes');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// Conectar ao banco de dados
connectDB();

// Middleware para analisar JSON
app.use(express.json());

// Usar rotas de email
app.use('/api/emails', emailRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
