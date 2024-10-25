// Importação das dependências necessárias
const whois = require('whois');
const dns = require('dns');
const nodemailer = require('nodemailer');

/**
 * Função para verificar a existência de um domínio usando WHOIS e registros MX.
 * @param {string} domain - O domínio a ser verificado.
 * @returns {Promise<boolean>} - Retorna true se o domínio existir, caso contrário false.
 * @throws {Error} - Se a pesquisa WHOIS falhar.
 */
const checkDomainExistence = async (domain) => {
  return new Promise((resolve, reject) => {
    // Faz a pesquisa WHOIS para o domínio
    whois.lookup(domain, (err, data) => {
      if (err) {
        reject(new Error('WHOIS lookup failed')); // Lança erro se a pesquisa falhar
      } else {
        // Verifica se o domínio foi encontrado
        if (data && data.includes('Domain Name:')) {
          // Verifica a idade do domínio
          const creationDateMatch = data.match(/Creation Date: (.+)/);
          if (creationDateMatch) {
            const creationDate = new Date(creationDateMatch[1]);
            const currentDate = new Date();
            const domainAgeInDays = (currentDate - creationDate) / (1000 * 60 * 60 * 24);
            if (domainAgeInDays < 7) {
              return resolve(false); // Domínio muito recente
            }
          }

          // Verifica a presença de registos MX
          dns.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
              resolve(false); // Sem registos MX
            } else {
              resolve(true); // Domínio possui registos MX
            }
          });
        } else {
          resolve(false); // Domínio não encontrado
        }
      }
    });
  });
};

/**
 * Função para verificar se o servidor SMTP do domínio está ativo.
 * @param {string} domain - O domínio a ser verificado.
 * @returns {Promise<boolean>} - Retorna true se o SMTP estiver ativo, caso contrário false.
 */
const verifySMTP = async (domain) => {
  // Cria um transportador SMTP para o domínio
  let transporter = nodemailer.createTransport({
    host: domain,
    port: 25,
    secure: false, // Não usa SSL
    requireTLS: true, // Requer TLS
    connectionTimeout: 5000, // Tempo limite de conexão
  });

  try {
    await transporter.verify(); // Tenta verificar a conexão SMTP
    return true; // SMTP está ativo
  } catch (error) {
    return false; // Falha na verificação do SMTP
  }
};

/**
 * Função principal para verificar a existência de um domínio utilizando WHOIS e verificação SMTP.
 * @param {string} domain - O domínio a ser verificado.
 * @returns {Promise<boolean>} - Retorna true se o domínio existir e tiver SMTP ativo, caso contrário false.
 */
const checkDomainExistenceWithSMTP = async (domain) => {
  const whoisResult = await checkDomainExistence(domain); // Verifica a existência do domínio

  if (!whoisResult) {
    return false; // Domínio falhou em WHOIS/MX
  }

  const smtpResult = await verifySMTP(domain); // Verifica se o SMTP está ativo
  return smtpResult; // Return do resultado da verificação SMTP
};

// Exporta a função para uso em outras partes da aplicação
module.exports = { checkDomainExistenceWithSMTP };
