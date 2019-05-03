// extract the links to all chapters of the story
// @returns [array]   array of chapters
getAllChapterLinks = () => {
	// find selector with drop down list
	const extractedChapters = document
		.querySelector("ul.table-of-contents")
		.getElementsByTagName("li");

	// push all chapter's link to chapter array
	const chapters = [];
	for (let chapter of extractedChapters) {
		chapters.push(chapter.querySelector("a.on-navigate").getAttribute("href"));
	}
	return chapters;
};

// from HTML DOM, extract essential data from JavaScript tag
// @return  {object}
getStoryJSONTag = () => {
	// grab script tag selector that contains JSON data
	const scriptSelector = $("script:contains('window.prefetched')")[0];
	// isolate variable window.prefetch to get JSON data
	const resultAsText = scriptSelector.outerText.match(
		/window.prefetched = (.*);/
	)[1];
	// parse text to JSON
	const resultAsJSON = JSON.parse(resultAsText);
	// pinpoint data field specifically
	return Object.entries(resultAsJSON)[0][1].data;
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
	getAllChapterLinks: getAllChapterLinks,
	getStoryJSONTag: getStoryJSONTag,
	extractContent: extractContent,
	autoScroll: autoScroll
};
