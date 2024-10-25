const mongoose = require('mongoose');
require('dotenv').config(); 
const Email = require('../models/emailModel'); 

const domains = [
  // Domínios blacklisted
  { email: 'tokobeken.xyz', isBlacklisted: true },
  { email: 'coredp.com', isBlacklisted: true },
  { email: 'infolinkai.com', isBlacklisted: true },
  { email: 'acaciaa.top', isBlacklisted: true },
  { email: 'gudri.com', isBlacklisted: true },
  { email: 'kimgmail.com', isBlacklisted: true },
  { email: 'kenvanharen.com', isBlacklisted: true },
  { email: 'cayxupro5.com', isBlacklisted: true },
  { email: 'healthbeautynatural.site', isBlacklisted: true },
  { email: 'boranora.com', isBlacklisted: true },
  { email: 'habosurechinhhangvietnam.online', isBlacklisted: true },
  { email: 'cloneads.top', isBlacklisted: true },
  { email: 'denxsu.net', isBlacklisted: true },
  { email: 'chupanhcuoidep.vn', isBlacklisted: true },
  { email: 'polakim.cfd', isBlacklisted: true },

  // Domínios aceites (não blacklisted)
  { email: 'gmail.com', isBlacklisted: false },
  { email: 'hotmail.com', isBlacklisted: false },
  { email: 'outlook.com', isBlacklisted: false },
  { email: 'ua.pt', isBlacklisted: false },
  { email: 'sapo.pt', isBlacklisted: false },
  { email: 'blockbastards.io', isBlacklisted: false },
];

async function insertEmails() {
  await Email.deleteMany(); 
  
  const emailPromises = domains.map(({ email, isBlacklisted }) => {
    const newEmail = new Email({ email, isBlacklisted });
    return newEmail.save()
      .then(() => console.log(`Email ${email} guardado com sucesso!`))
      .catch((error) => console.error(`Erro ao guardar o e-mail ${email}:`, error.message));
  });

  try {
    await Promise.all(emailPromises);
    console.log('Todos os e-mails foram processados!');
  } catch (error) {
    console.error('Erro ao processar e-mails:', error.message);
  }
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI); // Conexão com MongoDB
    console.log('Connected to MongoDB');
    await insertEmails();
  } catch (error) {
    console.error('Error to connect MongoDB:', error.message);
  } finally {
    mongoose.connection.close(); // Fecha a conexão
  }
}

main();
