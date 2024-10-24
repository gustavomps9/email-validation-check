const whois = require('whois');
const dns = require('dns');
const nodemailer = require('nodemailer');

// Função para verificar o domínio com WHOIS e registros MX
const checkDomainExistence = async (domain) => {
  return new Promise((resolve, reject) => {
    whois.lookup(domain, (err, data) => {
      if (err) {
        reject(new Error('WHOIS lookup failed'));
      } else {
        if (data && data.includes('Domain Name:')) {
          // Verifica a idade do domínio, se necessário
          const creationDateMatch = data.match(/Creation Date: (.+)/);
          if (creationDateMatch) {
            const creationDate = new Date(creationDateMatch[1]);
            const currentDate = new Date();
            const domainAgeInDays = (currentDate - creationDate) / (1000 * 60 * 60 * 24);
            if (domainAgeInDays < 30) {
              return resolve(false); // Domínio é muito recente
            }
          }
          
          // Verifica registros MX (SMTP)
          dns.resolveMx(domain, (err, addresses) => {
            if (err || addresses.length === 0) {
              resolve(false); // Sem registros MX
            } else {
              resolve(true); // Domínio tem registros MX
            }
          });
        } else {
          resolve(false);
        }
      }
    });
  });
};

// Função para verificar o servidor SMTP
const verifySMTP = async (domain) => {
  let transporter = nodemailer.createTransport({
    host: domain,
    port: 25,
    secure: false,
    requireTLS: true,
    connectionTimeout: 5000,
  });

  try {
    await transporter.verify();
    return true; // SMTP está ativo
  } catch (error) {
    return false; // Falha no SMTP
  }
};

// Função principal para verificar domínio
const checkDomainExistenceWithSMTP = async (domain) => {
  const whoisResult = await checkDomainExistence(domain);

  if (!whoisResult) {
    return false; // Domínio falhou em WHOIS/MX
  }

  const smtpResult = await verifySMTP(domain);
  return smtpResult; // Retorna o resultado SMTP
};

module.exports = { checkDomainExistenceWithSMTP };
