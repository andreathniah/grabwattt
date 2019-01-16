const { Cluster } = require("puppeteer-cluster");

const generalHelpers = require("./generalHelpers");
const scraperHelpers = require("./scraperHelpers");
const databaseHelpers = require("./databaseHelpers");

(async () => {
	cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 4,
		timeout: 3000000,
		monitor: false,
		puppeteerOptions: {
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage"
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

	// grab every chapter's content
	let story = [];
	let count = 0;

	for (let url of chapterURL) {
		const updatedURL = "https://www.wattpad.com" + url;
		await page.setUserAgent(useragent);
		await page.goto(updatedURL, { waitUntil: "domcontentloaded" });
		await autoScroll(page);
		const items = await page.evaluate(extractContent);
		story.push(items);
		console.log("[", storyId, "]", updatedURL);
		databaseHelpers.updateProgress(storyId, ++count, chapterURL.length);
	}

	// get story's summary content
	const summaryURL = "https://www.wattpad.com" + landingURL;
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
	databaseHelpers.deleteProgress(storyId);
};

module.exports = (url, storyId) => {
	return new Promise(async (resolve, reject) => {
		const useragent = generalHelpers.generateRandomUA();
		await cluster.queue({ url, storyId, useragent }, grabStory);

		// TODO: display waiting queue message if story is put on hold
		// TODO: allow 2nd scrapping try should timeout occurs
		cluster.on("taskerror", (err, data) => {
			if (err.message.includes("Timeout"))
				console.log("Timeout, trying again...");
			else {
				databaseHelpers.logError(storyId);
				console.log(err.message);
				reject(err.message);
			}
		});
		await cluster.idle();
		resolve(storyKey);
	});
};
