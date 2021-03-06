const axios = require('axios');
const moment = require('moment-timezone');
const Constants = require('../constants');

axios.defaults.headers.common['user-agent'] = Constants.USER_AGENT;

function authenticate() {
  return new Promise((resolve, reject) => {
    axios.get('https://api.coinmarketcal.com/oauth/v2/token', {
      params: {
        grant_type: 'client_credentials',
        client_id: process.env.COINMARKETCAL_CLIENT_ID,
        client_secret: process.env.COINMARKETCAL_CLIENT_SECRET,
      }
    }).then(response => {
      const data = response.data;
      const token = data.access_token;
      resolve(token);
    }).catch(error => {
      reject(error.response);
    });

  });
}
function fetchEvents(token) {
  return new Promise((resolve, reject) => {
    axios.get('https://api.coinmarketcal.com/v1/events', {
      params: {
        access_token: token,
        page: 1,
        max: 30,
        showOnly: 'hot_events',
        dateRangeEnd: moment().add(7, 'days').format('DD/MM/YYYY'),
      }
    }).then(response => {
      resolve(response.data);
    }).catch(error => {
      reject(error.response);
    });
  });
}
function getEvents() {
  return new Promise((resolve, reject) => {
    authenticate()
    .then(fetchEvents)
    .then(data => {
      const eventsText = data.map((event, index) => {
        const eventDate = moment(event.date_event).tz('Asia/Ho_Chi_Minh').format('MMM D');
        const coins = event.coins.map(coin => coin.symbol).join(', ');
        const title = event.title;
        const link = event.source;
        return `${index + 1}. [${coins}: ${title} - ${eventDate}](${link})`
      }).join('\n');
      resolve(`📅 *Các sự kiện sắp diễn ra:* \n\n${eventsText}\n\nXem thêm tại https://ICOVN.NET`);
    })
    .catch(error => {
      reject(error);
    });
  });
}

module.exports = {
  getEvents,
};
