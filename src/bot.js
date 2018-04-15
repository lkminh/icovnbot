const TelegramBot = require('node-telegram-bot-api');
const storage = require('./storage');
class Bot {
  constructor(config) {
    if (!config.token) {
      throw Error('config.token is missing');
    }
    this._bot = new TelegramBot(config.token, {polling: true});
    this._welcomeMessage = config.welcomeMessage || null;
    this._ownerId = parseInt(config.ownerId, 10);
    this.setupEvents();
  }
  setupEvents() {
    this._bot.onText(/\/welcome (.+)/, this.handleWelcomeCommand.bind(this));
    this._bot.on('new_chat_members', this.handleNewChatMembers.bind(this));
  }
  handleWelcomeCommand(message) {
    const chatId = message.chat.id;
    const senderId = message.from.id;
    if (this._ownerId !== senderId) {
    	return this.sendMessage(chatId, '`Forbidden!` Only the owner can set welcome message!');
    }
	const text = message.text.split('/welcome')[1];	
    if (text && text.length > 0) {
      this._welcomeMessage = text;
      storage.setItem('--welcome-message--', text).then(() => {
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
    const newMember = message.new_chat_member;

    if (this._welcomeMessage !== null) {
      const welcomeMessage = this.parseText(newMember, this._welcomeMessage);
      this.sendMessage(chatId, welcomeMessage , {
        parse_mode: 'Markdown',
      });	
    }
  }
  parseText(user, text) {
  	let result = text.split('$first_name').join(user.first_name);
  	result = result.split('$last_name').join(user.last_name);
  	return result;
  }
  sendMessage(chatId, message, options) {
    this._bot.sendMessage(chatId, message, options);
  }
}

module.exports = Bot