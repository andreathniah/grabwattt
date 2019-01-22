const clusterHelpers = require("./services/clusterHelpers");
const databaseHelpers = require("./services/databaseHelpers");
const generalHelpers = require("./services/generalHelpers");
const pdfHelpers = require("./services/pdfHelpers");

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

// POST request to start scraping
app.post("/", (req, res) => {
	let url = req.body.url;
	let storyId = req.body.storyId;
	console.log("requestedURL: ", url);

	const storyPromise = clusterHelpers(url, storyId);
	storyPromise
		.then(key => console.log("[CLUSTER] Queue streak ended => Id:", key))
		.catch(error => {
			console.log(error);
		});
	res.send({ url: storyId });
});

// POST request to generate PDF from stories
app.post("/pdf", (req, res) => {
	let pdfURL = req.body.url;
	console.log("requestedPDF: ", pdfURL);
	const pdfPromise = pdfHelpers(pdfURL);
	pdfPromise
		.then(buffer => {
			res.type("application/pdf");
			res.send(buffer);
		})
		.catch(error => console.log(error));
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
