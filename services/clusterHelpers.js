const { Cluster } = require("puppeteer-cluster");

const generalHelpers = require("./generalHelpers");
const scraperHelpers = require("./scraperHelpers");
const databaseHelpers = require("./databaseHelpers");

(async () => {
	cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 5,
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
	const metadata = await page.evaluate(scraperHelpers.getStoryJSONTag);
	const summaryURL = metadata.group.url;
	const storyTitle = metadata.group.title;
	const storyAuthor = metadata.group.user.username;
	const storySummary = metadata.group.description;
	const chapterURL = await page.evaluate(scraperHelpers.getAllChapterLinks);

	// grab every chapter's content
	let story = [];
	let count = 0;

	for (let url of chapterURL) {
		// go to new chapter
		const updatedURL = "https://www.wattpad.com" + url;
		await page.setUserAgent(useragent);
		await page.goto(updatedURL, { waitUntil: "domcontentloaded" });
		await page.waitFor(() => Math.floor(Math.random() * 5000) + 3000);

		// filter out the json tag and extract the url with all contents
		const jsonResult = await page.evaluate(scraperHelpers.getStoryJSONTag);
		await page.goto(jsonResult.text_url.text);

		// grab contents from API page
		const rawChapterContent = await page.evaluate(
			() => document.body.innerText
		);
		const chapterTitle = "<h5>" + jsonResult.title + "</h5>";

		// replace undesired characters outside of ASCII table
		const text0 = rawChapterContent.replace(/[…]/g, "...");
		const text1 = text0.replace(/[“]/g, '"');
		const text2 = text1.replace(/[”]/g, '"');
		const text3 = text2.replace(/[’]/g, "'");
		const text4 = text3.replace(/[•]/g, "-");
		const chapterContent = text4.replace(/[^\x00-\x7F]/g, "");

		const items = [];
		items.push("<!--ADD_PAGE-->"); // page break for jsPDF
		items.push(chapterTitle);
		items.push(chapterContent);
		story.push(items);
		console.log("[", storyId, "]", updatedURL);
		databaseHelpers.updateProgress(storyId, ++count, chapterURL.length);
	}

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
			if (err.message.includes("Timeout")) console.log("[TIMEOUT]", url);
			else {
				databaseHelpers.logError(data.storyId);
				reject(err.message);
			}
		});

		await cluster.idle();
		resolve(storyKey);
	});
};
