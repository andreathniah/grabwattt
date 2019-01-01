const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");

// create a hanful of browser instances and
// reuse them for each scrape request
const factory = {
	create: async function() {
		const browser = await puppeteer.launch({
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage"
				// "--single-process" // disable this in localhost
			]
		});
		return browser;
	},
	destroy: function(puppeteer) {
		puppeteer.close();
	}
};

const browserPool = genericPool.createPool(factory, {
	max: 10,
	min: 2,
	maxWaitingClients: 50
});

module.exports = browserPool;
