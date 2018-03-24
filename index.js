require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, {polling: true});

let welcomeMessage = null;

// Matches "/echo [text]"
bot.onText(/\/echo (.+)/, (message, match) => {
  console.log('onText: echo ');

  const chatId = message.chat.id;
  const text = match[1];

  // send back the matched "whatever" to the chat
  bot.sendMessage(chatId, `You sent *${text}*`, {
    parse_mode: 'Markdown',
  } );
});

bot.onText(/\/welcome (.+)/, (message, match) => {
  const chatId = message.chat.id;
  const text = match[1];	
  let responseMessage = '';
  if (text && text.length > 0) {
  	welcomeMessage = text;
  	responseMessage = 'Welcome message set!';
  } else {
  	responseMessage = 'Please specify a mesage';
  }
  bot.sendMessage(chatId, responseMessage);
});

bot.on('new_chat_members', (message, match) => {
  const chatId = message.chat.id;
  if (welcomeMessage !== null) {
  	bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
  	});	
  }
});

console.log('ICOVN bot is ready');