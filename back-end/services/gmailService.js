// Importação das dependências
const { google } = require('googleapis');
const { oAuth2Client } = require('../googleAuth/googleAuth.js'); 

// Inicializa o cliente da Gmail API com autenticação OAuth
const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

/**
 * Obtém a data do primeiro e-mail recebido na conta do Gmail.
 * @returns {Date|null} - A data do primeiro e-mail ou null se não houver e-mails.
 * @throws {Error} - Se ocorrer um erro ao acessar a API do Gmail.
 */
const getFirstEmailDate = async () => {
  try {
    // Solicita a lista de mensagens, ordenando por data (mais antigas primeiro)
    const res = await gmail.users.messages.list({
      userId: 'me',
      maxResults: 1,
      orderBy: 'oldest',
    });

    // Verifica se existe return de mensagens
    if (res.data.messages && res.data.messages.length > 0) {
      // Obtém o ID da primeira mensagem
      const messageId = res.data.messages[0].id; 
      // Recupera os detalhes da mensagem usando o ID
      const message = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
      });

      // Converte a data interna do e-mail para um objeto Date
      const emailDate = new Date(parseInt(message.data.internalDate));
      console.log(`First e-mail received in: ${emailDate}`);
      // Return da data do primeiro e-mail
      return emailDate; 
    } else {
       // Mensagem caso não haja e-mails
      console.log('No e-mail founded.');
      // Return null se não houver e-mails
      return null;
    }
  } catch (error) {
    // Captura e loga erros que ocorrerem ao acessar a API
    console.error('Error obtaining first e-mail', error);
    throw error;
  }
};

// Exporta a função para uso em outras partes da aplicação
module.exports = { getFirstEmailDate };
