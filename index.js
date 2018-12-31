const generatePDF = require("./services/generatePDF");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5001;
app.listen(port, () => console.log(`Server started on port: ${port}`));

// const whitelist = ["http://grabwatt.herokuapp.com"];
// const options = {
// 	origin: (origin, callback) => {
// 		if (whitelist.indexOf(origin) !== -1 || !origin) {
// 			callback(null, true);
// 		} else {
// 			callback(new Error("Not allowed by CORS"));
// 		}
// 	}
// };
// app.use(cors(options));

app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true
	})
);

app.get("/", (request, response) => {
	response.send("Home page");
});

app.post("/pdf", (req, res) => {
	let url = req.body.url;
	console.log("received request", url);
	console.log("Requested: ", new Date().toLocaleString());
	const pdfPromise = generatePDF(url);
	pdfPromise
		.then(buffer => {
			res.type("application/pdf");
			res.send(buffer);
			console.log("Delivered : ", new Date().toLocaleString());
		})
		.catch(error => console.log(error));
});
