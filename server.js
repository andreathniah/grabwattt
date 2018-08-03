const fs = require("fs");
var cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const firebase = require("firebase");

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
	let config = {
		apiKey: "AIzaSyDVAp4x8NHKEEjPxZeYVWAJ1yoW-und2QM",
		authDomain: "download-wattpad-fic.firebaseapp.com",
		databaseURL: "https://download-wattpad-fic.firebaseio.com"
	};
	firebase.initializeApp(config);
}
const db = firebase.database();

app.use(bodyParser.json());
app.get("/", (req, res) => {
	res.send({ url: "hello" });
});

app.post("/", (req, res) => {
	let requestedURL = req.body.url;

	if (!requestedURL) {
		return res
			.status(400)
			.send({ error: true, message: "Please provide wattpad URL" });
	} else {
		console.log("requestedURL: ", requestedURL);
		promise = startScraping(requestedURL);
		promise.then(function(key) {
			return res.send({ url: key });
		});
	}
});

extractLink = () => {
	return document
		.querySelector("div.toc-header.text-center")
		.querySelector("a.on-navigate")
		.getAttribute("href");
};

extractSummary = () => {
	// const a = "\u{100}";
	// const b = "\u{10FFF0}";
	// const regex = new RegExp(`[${a}-${b}]`, "g");

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

startScraping = async requestedURL => {
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
	for (let url of chapterURL) {
		const updatedURL = "https://www.wattpad.com" + url;
		await page.goto(updatedURL);
		await autoScroll(page);
		const items = await page.evaluate(extractContent);
		story.push(items);
		console.log(updatedURL);
	}

	const summaryURL = "https://www.wattpad.com" + landingURL;
	await page.goto(summaryURL);
	const storySummary = await page.evaluate(extractSummary);
	console.log("summaryURL: ", summaryURL);

	const storyKey = saveToFirebase(
		story,
		storyTitle,
		storyAuthor,
		storySummary,
		summaryURL
	);
	await browser.close();

	// fs.writeFileSync("./items.html", items.join("\n") + "\n");

	return storyKey;
};

let saveToFirebase = (
	story,
	storyTitle,
	storyAuthor,
	storySummary,
	storyURL
) => {
	let questionRef = db.ref("/");
	let newQuestionRef = questionRef.push();
	let newQuestionKey = newQuestionRef.key;
	newQuestionRef.set({
		title: storyTitle,
		author: storyAuthor,
		pages: story,
		summary: storySummary,
		url: storyURL
	});
	console.log("[#] Success => Id: ", newQuestionKey, "\n");
	return newQuestionKey;
};
