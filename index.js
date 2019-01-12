const startScraping = require("./services/extractStories");
const databaseHelpers = require("./services/databaseHelpers");
const generalHelpers = require("./services/generalHelpers");

const { Cluster } = require("puppeteer-cluster");
const scraperHelpers = require("./services/scraperHelpers");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const fs = require("fs");
const path = require("path");
const Epub = require("epub-gen");

const app = express();
const port = process.env.PORT || 5000;

// serve any static files and
// handle React routing, return all requests to React app
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "client/build")));
	app.get("*", (req, res) => {
		res.sendFile(path.join(__dirname, "client/build", "index.html"));
	});
}

app.listen(port, () => {
	// check any stories in "progress", delete them if there are
	databaseHelpers.onStartDeletion();
	console.log(`Server started on port: ${port}`);
});

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true
	})
);

(async () => {
	cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 2,
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

// POST request to start scraping
app.post("/", (req, res) => {
	let url = req.body.url;
	let storyId = req.body.storyId;
	console.log("requestedURL: ", url);

	const storyPromise = new Promise(async (resolve, reject) => {
		const useragent = generalHelpers.generateRandomUA();
		await cluster.queue({ url, storyId, useragent }, grabStory);
		await cluster.idle();
		resolve(storyKey);
	});

	storyPromise
		.then(key => {
			if (key) databaseHelpers.deleteProgress(storyId);
		})
		.catch(error => {
			databaseHelpers.logError(storyId);
			console.log(error);
		});
	res.send({ url: storyId });
});

// POST request to generate EPUB from stories
app.post("/epub", (req, res) => {
	let epubURL = req.body.url;
	let epubTitle = req.body.title;
	let epubAuthor = req.body.author;
	let epubContent = req.body.content;

	const option = {
		title: epubTitle, // *Required, title of the book.
		author: epubAuthor, // *Required, name of the author.
		content: epubContent
	};

	// replace names with dash as it would be considered as a directory
	const escapedTitle = epubTitle.replace(/[/]/g, "");
	const fileName = `archive/${escapedTitle}.epub`;

	// create directory if not available
	const dir = "./archive";
	if (!fs.existsSync(dir)) fs.mkdirSync(dir);

	const epubPromise = new Promise((resolve, reject) => {
		new Epub(option, fileName).promise
			.then(() => {
				resolve(true);

				console.log("[EPUB] Success => Id: ", epubURL, "\n");
				generalHelpers.analytics
					.event("downloads", "epub", "server-download-epub")
					.send();
			})
			.catch(err => reject(err));
	});

	epubPromise.then(
		status => {
			const file = __dirname + `/${fileName}`;
			res.download(file, "report.pdf", err => {
				if (!err) {
					// delete local image of .epub after 3 seconds
					setTimeout(() => {
						fs.unlink(fileName, err => {
							if (!err) console.log("Local image deleted");
							else console.log(err);
						});
					}, 3000);
				}
			});
		},
		error => console.log(error)
	);
});
