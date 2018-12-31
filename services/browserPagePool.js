const puppeteer = require("puppeteer");
const genericPool = require("generic-pool");

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

		const page = await browser.newPage();
		await page.setViewport({ width: 800, height: 420 });
		return page;
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
