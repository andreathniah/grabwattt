const startScraping = require("./services/extractStories");
const databaseHelpers = require("./services/databaseHelpers");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;
app.listen(port, () => {
	// check if database in progress has anything, set them to error if there is
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

app.get("/pdf", (req, res) => {
	// let url = req.body.url;
	// let storyId = req.body.storyId;
	let url =
		"https://www.wattpad.com/231625806-road-to-redemption-the-conclusion-to-%27living-with";
	let storyId = 12345;
	console.log("requestedURL: ", url);

	const storyPromise = startScraping(url, storyId);
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
