const { Cluster } = require("puppeteer-cluster");

const generalHelpers = require("./generalHelpers");
const scraperHelpers = require("./scraperHelpers");
const databaseHelpers = require("./databaseHelpers");

(async () => {
	cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 3,
		monitor: false,
		puppeteerOptions: {
			headless: false,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage"
				// "--single-process" // disable this in localhost
			]
		}
	});
})();

let storyKey = "";
grabStory = async ({ page, data }) => {
	const { url, storyId, useragent } = data;

	await page.setUserAgent(useragent);
	await page.setExtraHTTPHeaders({ Referer: "https://www.wattpad.com" });
	await page.goto(url, { waitUntil: "domcontentloaded" });

	// grab miscellaneous details
	const storyTitle = await page.evaluate(scraperHelpers.extractTitle);
	const storyAuthor = await page.evaluate(scraperHelpers.extractAuthor);
	const chapterURL = await page.evaluate(scraperHelpers.extractChapters);
	const landingURL = await page.evaluate(scraperHelpers.extractLink); // find link to summary page

	console.log(storyTitle, storyAuthor, chapterURL, landingURL);

	// grab every chapter's content
	let story = [];
	let count = 0;

	for (let url of chapterURL) {
		const updatedURL = "https://www.wattpad.com" + url;
		await cluster.queue(async ({ page }) => {
			await page.setUserAgent(useragent);
			await page.goto(updatedURL, { waitUntil: "domcontentloaded" });
			await autoScroll(page);
			const items = await page.evaluate(extractContent);
			story.push(items);
			console.log("[", storyId, "]", updatedURL);
			databaseHelpers.updateProgress(storyId, ++count, chapterURL.length);
		});
	}

	// get story's summary content
	const summaryURL = "https://www.wattpad.com" + landingURL;
	await cluster.queue(async ({ page }) => {
		await page.setUserAgent(useragent);
		await page.goto(summaryURL, { waitUntil: "domcontentloaded" });
		const storySummary = await page.evaluate(extractSummary);
		// save details to database
		storyKey = databaseHelpers.saveToFirebase(
			story,
			storyTitle,
			storyAuthor,
			storySummary,
			summaryURL,
			storyId
		);
		console.log("summaryURL: ", summaryURL);
	});

	await cluster.idle();
};

module.exports = (url, storyId) => {
	return new Promise(async (resolve, reject) => {
		const useragent = generalHelpers.generateRandomUA();
		await cluster.queue({ url, storyId, useragent }, grabStory);
		cluster.on("taskerror", (err, data) => reject(err.message));
		await cluster.idle();
		resolve(storyKey);
	});
};
