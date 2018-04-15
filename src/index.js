require('dotenv').config();

const Bot = require('./bot');
const storage = require('./storage');
const token = process.env.BOT_TOKEN;
const ownerId = process.env.OWNER_ID;

storage.init().then(() => {
  const welcomeMessage = storage.getItemSync('--welcome-message--');
  const bot = new Bot({
    token: token,
    welcomeMessage : welcomeMessage,
    ownerId: ownerId,
  });
  console.log('ICOVN bot is ready');
}).catch((e) => {
  console.log(`Failed to load storage. Error: ${e.message}`)
});