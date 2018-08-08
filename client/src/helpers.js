import * as jsPDF from "jspdf";
import { longAssString } from "./longAssString";

// generate PDF with page breaks
export function generatePDF(storyTitle, storyAuthor) {
	// https://plnkr.co/edit/64KOSxMgDWfRUfg2bxfo?p=preview
	var pdf = new jsPDF();
	var pdfName = storyTitle + " " + storyAuthor + ".pdf";
	var options = { width: 170, pagesplit: true };

	var images = document.getElementsByTagName("img");
	var l = images.length;
	for (var i = 0; i < l; i++) {
		images[0].parentNode.removeChild(images[0]);
	}

	var div = document.getElementsByClassName("print-container");

	var noRecursionNeeded = div.length;
	var currentRecursion = 0;
	console.log("creating pdf...");
	recursiveAddHtmlAndSave(currentRecursion, noRecursionNeeded);

	function recursiveAddHtmlAndSave(currentRecursion, totalRecursions) {
		//Once we have done all the divs save the pdf
		if (currentRecursion === totalRecursions) {
			// pdf.addPage();
			pdf.save(pdfName);
		} else {
			pdf.fromHTML(div[currentRecursion], 15, 15, options, function() {
				console.log(
					"Appending - chapter ",
					currentRecursion,
					" of ",
					totalRecursions
				);
				currentRecursion++;
				recursiveAddHtmlAndSave(currentRecursion, totalRecursions);
			});
		}
	}
}

// generate PDF without page breaks
export function convertToPDF(storyTitle, storyAuthor) {
	console.log("creating pdf:", storyTitle);
	var doc = new jsPDF();
	var PTSans = longAssString;
	doc.addFileToVFS("PTSans.ttf", PTSans);
	doc.addFont("PTSans.ttf", "PTSans", "normal");
	doc.setFont("PTSans"); // set font

	var margins = {
		top: 20,
		bottom: 20,
		left: 10,
		width: 170
	};
	var options = { width: margins.width, pagesplit: true };
	var pdfName = storyTitle + " " + storyAuthor + ".pdf";

	doc.fromHTML(
		document.getElementById("summary-container"),
		margins.left, // x coord
		margins.top,
		options
	);

	doc.fromHTML(
		document.getElementById("story-container"),
		margins.left, // x coord
		5,
		options,
		function() {
			doc.save(pdfName);
		}
	);
}
