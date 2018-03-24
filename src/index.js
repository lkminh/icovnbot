require('dotenv').config();

const Bot = require('./bot');
const storage = require('./storage');
const token = process.env.BOT_TOKEN;

storage.init().then(() => {
  const welcomeMessage = storage.getItemSync('welcomeMessage');
  const bot = new Bot({
    token: token,
    welcomeMessage : welcomeMessage,
  });
  console.log('ICOVN bot is ready');
}).catch((e) => {
  console.log(`Failed to load storage. Error: ${e.message}`)
});