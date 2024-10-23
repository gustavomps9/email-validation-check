const dotenv = require('dotenv');
// Carrega as variáveis de ambiente
dotenv.config();

const { google } = require('googleapis');

console.log('Client ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Client Secret:', process.env.GOOGLE_CLIENT_SECRET);
console.log('Redirect URI:', process.env.GOOGLE_REDIRECT_URI);

const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID, 
  process.env.GOOGLE_CLIENT_SECRET, 
  process.env.GOOGLE_REDIRECT_URI 
);

// Gera o URL de autorização
const getGoogleAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
  ];

  return oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
  });
};

// Função auxiliar para obter a data da conta do Gmail
const getGmailAccountFromCode = async (code) => {
  try {
    console.log('Received authorization code:', code);

    // Obtém os tokens usando o código de autorização
    const { tokens } = await oAuth2Client.getToken(code);
    console.log('Tokens received:', tokens); // Log para verificar os tokens recebidos

    oAuth2Client.setCredentials(tokens);
    console.log('OAuth2 client credentials set.'); // Confirmação de que as credenciais foram definidas

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    // Obtém o primeiro email da conta
    const response = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      q: '',
    });

    // Valida a resposta da API para garantir que há mensagens disponíveis
    if (!response.data || !response.data.messages || response.data.messages.length === 0) {
      console.error('No messages found or unexpected response structure:', response.data);
      throw new Error('No emails found in the account.');
    }

    const messageId = response.data.messages[0].id;
    console.log('First message ID:', messageId); // Log para verificar o ID da mensagem

    const message = await gmail.users.messages.get({
      userId: 'me',
      id: messageId,
    });

    console.log('Message details:', message.data); // Log para verificar os detalhes da mensagem

    const emailDate = new Date(parseInt(message.data.internalDate));
    console.log('First email date:', emailDate);
    return { emailDate };
  } catch (error) {
    console.error('Error fetching Gmail account information:', error);
    throw error;
  }
};



// Exporta as funções relevantes
module.exports = {
  getGoogleAuthUrl,
  getGmailAccountFromCode,
};
