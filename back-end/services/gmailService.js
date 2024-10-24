const { google } = require('googleapis');
const { oAuth2Client } = require('../googleAuth/googleAuth.js'); 

// Usar o cliente OAuth para aceder à Gmail API
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

// Verificar a data do primeiro email após a autenticação
const getFirstEmailDate = async () => {
  try {
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      orderBy: 'oldest',
    });

    if (res.data.messages && res.data.messages.length > 0) {
      const messageId = res.data.messages[0].id;
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      const emailDate = new Date(parseInt(message.data.internalDate));
      console.log(`Primeiro email recebido em: ${emailDate}`);
      return emailDate;
    } else {
      console.log('Nenhum email encontrado.');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter o primeiro email:', error);
    throw error;
  }
};

module.exports = { getFirstEmailDate };
