const startScraping = require("./services/extractStories");
const databaseHelpers = require("./services/databaseHelpers");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server started on port: ${port}`));

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true
	})
);

app.post("/pdf", (req, res) => {
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
