const fetch = require('isomorphic-fetch');

function fetchPrices() {
  return new Promise((resolve, reject) => {
    fetch('https://api.coinmarketcap.com/v1/ticker/?limit=10')
		.then((response) => response.json())
		.then((json) => {
		  resolve(json);
		}).catch((err) => {
      reject(err);
		});
  });
}

function getPrices() {
  return new Promise((resolve, reject) => {
    fetchPrices()
      .then((coinList) => {
        const coinListString = coinList.map((coin) => {
    			return `\`${coin.name}\` -- *$${coin.price_usd}* (${coin.percent_change_24h}%)`;
    		}).join('\n');
    		const result = `${coinListString} \n\n Xem thêm tại https://ICOVN.NET`;
    		resolve(result);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

module.exports = {
  getPrices
};
