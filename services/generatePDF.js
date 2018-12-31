const browserPagePool = require("./browserPagePool");

module.exports = async url => {
	const page = await browserPagePool.acquire();
	await page.goto(url);
	await page.waitForSelector(".page");
	const buffer = await page.pdf({
		format: "A4",
		margin: { left: "2cm", top: "2.5cm", right: "2cm", bottom: "2.5cm" }
	});
	console.log("[PDF] Success => Id: ", url, "\n");
	await browserPagePool.release(page);

	return buffer;
};
