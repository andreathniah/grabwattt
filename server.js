const fs = require("fs");
var cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const firebase = require("firebase");

var secretKey = require("./secret.js");

// express configurations
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

if (process.env.NODE_ENV === "production") {
	// Serve any static files
	app.use(express.static(path.join(__dirname, "client/build")));
	// Handle React routing, return all requests to React app
	app.get("*", function(req, res) {
		res.sendFile(path.join(__dirname, "client/build", "index.html"));
	});
}
app.listen(port, () => console.log(`Listening on port ${port}`));

// firebase configurations
if (!firebase.apps.length) {
	firebase.initializeApp(secretKey.firebaseKey);
}
const db = firebase.database();

app.use(bodyParser.json());
app.get("/", (req, res) => {
	res.send({ url: "hello" });
});

app.post("/", (req, res) => {
	let requestedURL = req.body.url;
	let storyId = req.body.storyId;

	console.log("requestedURL: ", requestedURL);
	promise = startScraping(requestedURL, storyId);

	const whitenoiseHack = setInterval(() => {
		console.log("interviewing the interval");
	}, 25000);

	promise.then(key => {
		clearInterval(whitenoiseHack);
		if (key) {
			res.send({ url: key });
			deleteProgress(storyId);
		} else {
			res.send({ error: true, message: "oops, something went wrong" });
		}
	});
});

extractLink = () => {
	return document
		.querySelector("div.toc-header.text-center")
		.querySelector("a.on-navigate")
		.getAttribute("href");
};

extractSummary = () => {
	const extractedSummary = document.querySelector("h2.description > pre")
		.innerHTML;

	const text = extractedSummary.replace(/…/g, "...");
	const removedUTF8 = text.replace(/[^\x00-\x7F]/g, "");
	return removedUTF8;
};

extractTitle = () => {
	return document.getElementsByClassName("title h5")[0].innerText;
};

extractAuthor = () => {
	return document.getElementsByClassName("author h6")[0].innerText;
};

extractChapters = () => {
	const extractedChapters = document
		.querySelector("ul.table-of-contents")
		.getElementsByTagName("li");

	const chapters = [];
	for (let chapter of extractedChapters) {
		chapters.push(chapter.querySelector("a.on-navigate").getAttribute("href"));
	}
	return chapters;
};

extractContent = () => {
	$(".comment-marker").remove();
	const extractedElements = document.querySelectorAll("p[data-p-id]");
	const chapterTitle = document.querySelector("header > h2");

	const items = [];
	const title = "<h5>" + chapterTitle.innerHTML + "</h5>";
	items.push("<!--ADD_PAGE-->");
	items.push(title);

	for (let element of extractedElements) {
		const text = element.innerHTML.replace(/…/g, "...");
		const removedUTF8 = text.replace(/[^\x00-\x7F]/g, "");

		const paragraph = "<p>" + removedUTF8 + "</p>";
		items.push(paragraph);
	}
	return items;
};

autoScroll = page => {
	return page.evaluate(() => {
		return new Promise((resolve, reject) => {
			var totalHeight = 0;
			var distance = 100;
			var timer = setInterval(() => {
				var scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight) {
					clearInterval(timer);
					resolve();
				}
			}, 100);
		});
	});
};

startScraping = async (requestedURL, storyId) => {
	const browser = await puppeteer.launch({
		headless: true,
		args: ["--no-sandbox", "--disable-setuid-sandbox"]
	});
	const page = await browser.newPage();
	await page.goto(requestedURL);

	// grab miscellaneous details
	const storyTitle = await page.evaluate(extractTitle);
	const storyAuthor = await page.evaluate(extractAuthor);
	const chapterURL = await page.evaluate(extractChapters);
	const landingURL = await page.evaluate(extractLink); // find link to summary page
	const story = [];

	// grab every chapter's content
	var count = 0;

	for (let url of chapterURL) {
		// const updatedURL = "https://cors-anywhere.herokuapp.com/wattpad.com" + url;
		const updatedURL = "https://www.wattpad.com" + url;
		await page.goto(updatedURL);
		await autoScroll(page);
		const items = await page.evaluate(extractContent);
		story.push(items);
		console.log(updatedURL);
		updateProgress(storyId, ++count, chapterURL.length);
	}

	const summaryURL =
		// "https://cors-anywhere.herokuapp.com/wattpad.com" + landingURL;
		"https://www.wattpad.com" + landingURL;
	await page.goto(summaryURL);
	const storySummary = await page.evaluate(extractSummary);
	console.log("summaryURL: ", summaryURL);

	const storyKey = saveToFirebase(
		story,
		storyTitle,
		storyAuthor,
		storySummary,
		summaryURL,
		storyId
	);
	await browser.close();

	// fs.writeFileSync("./items.html", items.join("\n") + "\n");

	return storyKey;
};

updateProgress = async (storyId, counter, total) => {
	const progressRef = db.ref("progress/" + storyId);
	progressRef.set({ current: counter, total: total });
};

deleteProgress = storyId => {
	const progressRef = db.ref("progress/" + storyId);
	progressRef.set({ current: null, total: null });
};

let saveToFirebase = (
	story,
	storyTitle,
	storyAuthor,
	storySummary,
	storyURL,
	storyId
) => {
	const storyRef = db.ref("story/" + storyId);
	storyRef.set({
		title: storyTitle,
		author: storyAuthor,
		pages: story,
		summary: storySummary,
		url: storyURL
	});

	console.log("[#] Success => Id: ", storyId, "\n");
	return storyId;
};
