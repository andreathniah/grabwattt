const browserPagePool = require("./browserPagePool");
const generalHelpers = require("./generalHelpers");
const scraperHelpers = require("./scraperHelpers");
const databaseHelpers = require("./databaseHelpers");

module.exports = async (url, storyId) => {
	const browser = await browserPagePool.acquire();
	const useragent = generalHelpers.generateRandomUA();
	console.log("[" + storyId + "]", useragent);

	const page = await browser.newPage();
	await page.setUserAgent(useragent);
	await page.setExtraHTTPHeaders({ Referer: "https://www.wattpad.com" });
	await page.goto(url, { waitUntil: "domcontentloaded" });

	try {
		// grab miscellaneous details
		const storyTitle = await page.evaluate(scraperHelpers.extractTitle);
		const storyAuthor = await page.evaluate(scraperHelpers.extractAuthor);
		const chapterURL = await page.evaluate(scraperHelpers.extractChapters);
		const landingURL = await page.evaluate(scraperHelpers.extractLink); // find link to summary page

		// grab every chapter's content
		const story = [];
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
		console.log("summaryURL: ", summaryURL);

		// to keep a lookout, might not be required
		page.on("error", error => {
			page.goto("about:blank");
			page.close();
			databaseHelpers.logError(storyId);
			console.log(error);
		});

		// save details to database
		const storyKey = databaseHelpers.saveToFirebase(
			story,
			storyTitle,
			storyAuthor,
			storySummary,
			summaryURL,
			storyId
		);

		return storyKey;
	} catch (error) {
		// to keep a look out, might not be required
		await page.goto("about:blank");
		await page.close();
		logError(storyId);
		console.log(error);
	}
	await browserPagePool.release(page);
};
