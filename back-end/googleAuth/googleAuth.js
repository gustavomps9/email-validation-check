const express = require('express');
const { google } = require('googleapis');
const open = require('open');
const fs = require('fs');
const path = require('path');
const os = require('os');

const app = express();
const PORT = 5001;

// Carregar as credenciais do OAuth 2.0
const CLIENT_ID = '';
const CLIENT_SECRET = '';
const REDIRECT_URI = '';


// Cria um cliente OAuth 2.0
const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

// Função para redirecionar o utilizador para o login do Google
app.get('/auth', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  res.redirect(authUrl);
});

// Recebe o código de autenticação e troca por tokens
app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    // Guarda os tokens num ficheiro chamado 'token.txt' no ambiente de trabalho
    const desktopPath = path.join(os.homedir(), 'Desktop', 'token.txt');
    fs.writeFileSync(desktopPath, JSON.stringify(tokens));
    res.send('Authentication successful! Tokens saved to Desktop as token.txt.');
  } catch (error) {
    console.error('Error retrieving access token', error);
    res.status(500).send('Authentication failed');
  }
});

// Inicia o servidor e abre a página de autenticação
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  open(`http://localhost:${PORT}/auth`); // Abre automaticamente a página de autenticação
});

// Exporta o cliente OAuth para reutilização
module.exports = { oAuth2Client };
