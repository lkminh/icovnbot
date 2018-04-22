const TelegramBot = require('node-telegram-bot-api');
const CronJobManager = require('cron-job-manager');
const storage = require('./storage');
const { getPrices } = require('./features/price');
const { getEvents } = require('./features/events');

class Bot {
  constructor(config) {
    if (!config.token) {
      throw Error('config.token is missing');
    }
    this._bot = new TelegramBot(config.token, {polling: true});
    this._welcomeMessage = config.welcomeMessage || null;
    this._ownerId = parseInt(config.ownerId, 10);
    this.setupEvents();
    this.startCronJob();
  }
  setupEvents() {
    this._bot.onText(/\/welcome (.+)/, this.handleWelcomeCommand.bind(this));
    this._bot.on('new_chat_members', this.handleNewChatMembers.bind(this));
    this._bot.onText(/\/test (.+)/, this.handleTestCommand.bind(this));
  }
  startCronJob() {
    const manager = new CronJobManager(
      'prices',
      '0 0/4 * * *',
      () => this.fetchPrices(),
    )
    manager.add(
      'events',
      '0 2/4 * * *',
      () => this.fetchEvents(),
    );
    manager.start('prices');
    manager.start('events');
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
  handleTestCommand(message) {
    const chatId = message.chat.id;
    const senderId = message.from.id;
    if (this._ownerId !== senderId) {
    	return this.sendMessage(chatId, '`Forbidden!` Only the owner can use this command!');
    }
    const text = message.text.split('/test')[1];
    if (text && text.length > 0) {
      this.sendMessage(chatId, `You sent: \n${text}`);
    } else {
      this.sendMessage(chatId, 'Wrong format! Should be `/test _message_`');
    }
  }
  parseText(user, text) {
  	let result = text.split('$first_name').join(user.first_name);
  	result = result.split('$last_name').join(user.last_name);
  	return result;
  }
  sendMessage(chatId, message, options) {
    const finalOptions = Object.assign({parse_mode: 'Markdown'}, options);
    this._bot.sendMessage(chatId, message, finalOptions);
  }
  fetchPrices() {
    const chatId = process.env.CHAT_ID;
    const ownerId = process.env.OWNER_ID;
  	getPrices()
  	 .then((result) => this.sendMessage(chatId, result))
  	 .catch((err) => this.sendMessage(ownerId, err.message));
  }
  fetchEvents() {
    const chatId = process.env.CHAT_ID;
    const ownerId = process.env.OWNER_ID;
  	getEvents()
  	 .then((result) => this.sendMessage(chatId, result, {disable_web_page_preview: true}))
  	 .catch((err) => this.sendMessage(ownerId, err.message));
  }
}

module.exports = Bot
