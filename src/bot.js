const TelegramBot = require('node-telegram-bot-api');
const storage = require('./storage');
class Bot {
  constructor(config) {
    if (!config.token) {
      throw Error('config.token is missing');
    }
    this._bot = new TelegramBot(config.token, {polling: true});
    this._welcomeMessage = config.welcomeMessage || null;
    this.setupEvents();
  }
  setupEvents() {
    this._bot.onText(/\/welcome (.+)/, this.handleWelcomeCommand.bind(this));
    this._bot.on('new_chat_members', this.handleNewChatMembers.bind(this));
  }
  handleWelcomeCommand(message, match) {
    const chatId = message.chat.id;
    const text = match[1];	
    if (text && text.length > 0) {
      this._welcomeMessage = text;
      storage.setItem('welcomeMessage', text).then(() => {
        console.log('set welcome message');
        this.sendMessage(chatId, 'Welcome message set!');
      }).catch(() => {
        this.sendMessage(chatId, 'Failed to set welcome message');
      });
    } else {
      this.sendMessage(chatId, 'Please specify a mesage');
    }
  }
  handleNewChatMembers(message) {
    const chatId = message.chat.id;
    const user = message.from;

    if (this._welcomeMessage !== null) {
      const welcomeMessage = `Hello *${user.first_name} ${user.last_name}*! ${this._welcomeMessage}`;
      this.sendMessage(chatId, welcomeMessage , {
        parse_mode: 'Markdown',
      });	
    }
  }
  sendMessage(chatId, message, options) {
    this._bot.sendMessage(chatId, message, options);
  }
}

module.exports = Bot