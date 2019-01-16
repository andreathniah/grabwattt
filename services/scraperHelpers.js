// extract link to the story's summary
extractLink = () => {
	return document
		.querySelector("div.toc-header.text-center")
		.querySelector("a.on-navigate")
		.getAttribute("href");
};

// extract story summary
extractSummary = () => {
	const extractedSummary = document.querySelector("h2.description > pre")
		.innerHTML;

	// replace characters not conforming with ACSII table
	const text = extractedSummary.replace(/…/g, "...");
	const removedUTF8 = text.replace(/[^\x00-\x7F]/g, "");
	return removedUTF8;
};

// extract story title
extractTitle = () => {
	return document.getElementsByClassName("title h5")[0].innerText;
};

// extract author name
extractAuthor = () => {
	return document.getElementsByClassName("author h6")[0].innerText;
};

// extract the links to all chapters of the story
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

// extract story content and get rid of comments
extractContent = () => {
	$(".comment-marker").remove();
	const extractedElements = document.querySelectorAll("p[data-p-id]");
	const chapterTitle = document.querySelector("header > h2");

	const items = [];
	const title = "<h5>" + chapterTitle.innerHTML + "</h5>";
	items.push("<!--ADD_PAGE-->");
	items.push(title);

	// replace undesired characters outside of ASCII table
	for (let element of extractedElements) {
		const text0 = element.innerHTML.replace(/[…]/g, "...");
		const text1 = text0.replace(/[“]/g, '"');
		const text2 = text1.replace(/[”]/g, '"');
		const text3 = text2.replace(/[’]/g, "'");
		const removedUTF8 = text3.replace(/[^\x00-\x7F]/g, "");

		const paragraph = "<p>" + removedUTF8 + "</p>";
		items.push(paragraph);
	}
	return items;
};

// scroll wattpad story to the end of the chapter
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
			}, 50);
		});
	});
};

module.exports = {
	extractLink: extractLink,
	extractSummary: extractSummary,
	extractTitle: extractTitle,
	extractAuthor: extractAuthor,
	extractChapters: extractChapters,
	extractContent: extractContent,
	autoScroll: autoScroll
};
