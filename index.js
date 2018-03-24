require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

// Matches "/echo [text]"
bot.onText(/\/echo (.+)/, (message, match) => {
  console.log('onText: ' + message);

  const chatId = message.chat.id;
  const text = match[1];

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, `You sent *${text}*`, {
    parse_mode: 'Markdown',
  } );
});

console.log('ICOVN bot is ready');