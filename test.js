const puppeteer = require("puppeteer");
(async () => {
	const browser = await puppeteer.launch();
	const page = await browser.newPage();
	await page.goto("http://localhost:3000/3163364");
	await page.waitForSelector(".page");
	const buffer = await page.pdf({
		path: "medium.pdf",
		format: "A4",
		margin: { left: "2cm", top: "2.5cm", right: "1cm", bottom: "2.5cm" }
	});
	res.type("application/pdf");
	res.send(buffer);

	browser.close();
})();
