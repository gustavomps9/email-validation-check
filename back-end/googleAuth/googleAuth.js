const express = require('express');
const { google } = require('googleapis');
const dotenv = require('dotenv');
const validator = require('validator'); // Para validar o formato do email
const Email = require('./models/emailModel'); // Modelo para emails confiáveis e lista negra

// Carrega variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do OAuth2 para a Google API
const oAuth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID, 
  process.env.CLIENT_SECRET, 
  process.env.REDIRECT_URI 
);

app.use(express.json());

// Função auxiliar para verificar se o email está na lista negra
const isDomainBlacklisted = async (domain) => {
  const blacklistedDomain = await Email.findOne({ email: new RegExp(domain, 'i'), isBlacklisted: true });
  return !!blacklistedDomain; // Retorna true se o domínio estiver na lista negra
};

// Rota para verificar o email
app.post('/verify', async (req, res) => {
  const { email } = req.body;

  // Valida o formato do email
  if (!validator.isEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Extrai o domínio do email
  const domain = email.split('@')[1];

  // Verifica se o domínio está na lista negra
  if (await isDomainBlacklisted(domain)) {
    return res.json({ result: 'failed', reason: 'Domain is blacklisted' });
  }

  // Se for um email do Gmail, inicia o fluxo de verificação de idade da conta
  if (domain === 'gmail.com') {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    });
    return res.json({ result: 'gmail', redirectUrl: authUrl });
  }

  // Para emails que **não** são do Gmail, se passaram a validação e a lista negra, o email é aceito
  return res.json({ result: 'passed', reason: 'Valid email, non-Gmail domain' });
});

// Rota de callback após a autenticação para verificar a idade da conta Gmail
app.get('/oauth2callback', async (req, res) => {
  const { code } = req.query; // Código fornecido pelo Google

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Obtém o primeiro email da conta
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      q: '',
    });

    if (response.data.messages && response.data.messages.length > 0) {
      const messageId = response.data.messages[0].id;
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const emailDate = new Date(parseInt(message.data.internalDate));
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);

      // Se o email foi criado há menos de 1 dia, falha
      if (emailDate > oneDayAgo) {
        return res.send('Account too new (less than 1 day)');
      } else {
        return res.send('Account verified successfully.');
      }
    } else {
      return res.send('No emails found in the account.');
    }
  } catch (error) {
    console.error('Error during authentication or email fetching:', error);
    res.status(500).send('Error during authentication or email fetching.');
  }
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
