const puppeteer = require("puppeteer");
const generalHelpers = require("./generalHelpers");

// open new broswer for each PDF request
module.exports = async pdfURL => {
	const pdfBrowser = await puppeteer.launch({
		headless: true,
		args: [
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-dev-shm-usage",
			"--single-process" // disable this in localhost
		]
	});

	const page = await pdfBrowser.newPage();
	await page.goto(pdfURL);
	await page.waitForSelector(".page"); // wait for react to show contents

	console.log("pdfURL: ", pdfURL);

	const buffer = await page.pdf({
		format: "A4",
		margin: { left: "2cm", top: "2.5cm", right: "2cm", bottom: "2.5cm" }
	});

	console.log("[PDF] Success => Id: ", pdfURL, "\n");
	generalHelpers.analytics
		.event("downloads", "pdf", "server-download-pdf")
		.send();

	pdfBrowser.close();
	return buffer;
};
