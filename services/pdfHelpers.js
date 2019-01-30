const { Cluster } = require("puppeteer-cluster");
const generalHelpers = require("./generalHelpers");

(async () => {
	cluster = await Cluster.launch({
		concurrency: Cluster.CONCURRENCY_PAGE,
		maxConcurrency: 4,
		timeout: 3000000,
		monitor: false,
		puppeteerOptions: {
			headless: true,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage"
				// "--single-process" // disable this in localhost
			]
		}
	});
})();

const pdfBuffer = [];
grabPDF = async ({ page, data }) => {
	await page.setViewport({ width: 800, height: 420 });
	await page.goto(data);
	await page.waitForSelector(".page");
	const buffer = await page.pdf({
		format: "A4",
		margin: { left: "2cm", top: "2.5cm", right: "2cm", bottom: "2.5cm" }
	});

	pdfBuffer.push(buffer);
};

module.exports = (url, storyId) => {
	return new Promise(async (resolve, reject) => {
		await cluster.queue(url, grabPDF);

		// TODO: allow 2nd pdf download try should timeout occurs
		cluster.on("taskerror", (err, data) => {
			console.log(err.message);
			reject(err.message);
		});
		await cluster.idle();
		generalHelpers.analytics
			.event("downloads", "pdf", "server-download-pdf")
			.send();

		console.log("[PDF] Success => Id: ", url, "\n");
		resolve(pdfBuffer[0]);
	});
};
