const startScraping = require("./services/extractStories");
const databaseHelpers = require("./services/databaseHelpers");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

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

app.post("/", (req, res) => {
	let url = req.body.url;
	let storyId = req.body.storyId;
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
