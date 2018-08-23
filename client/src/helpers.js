import * as jsPDF from "jspdf";
import { longAssString } from "./longAssString";

// generate PDF with page breaks
export function generatePDF(storyTitle, storyAuthor) {
  // https://plnkr.co/edit/64KOSxMgDWfRUfg2bxfo?p=preview
  var pdf = new jsPDF();
  var pdfName = storyTitle + " " + storyAuthor + ".pdf";

  var margins = {
    top: 15,
    bottom: 15,
    left: 15,
    width: 180
  };

  var images = document.getElementsByTagName("img");
  var l = images.length;
  for (var i = 0; i < l; i++) {
    images[0].parentNode.removeChild(images[0]);
    console.log("done");
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
      pdf.fromHTML(
        div[currentRecursion],
        margins.left,
        margins.top,
        { width: margins.width },
        function() {
          console.log(
            "Appending - chapter ",
            currentRecursion,
            " of ",
            totalRecursions
          );
          currentRecursion++;
          recursiveAddHtmlAndSave(currentRecursion, totalRecursions);
        },
        margins
      );
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

  var images = document.getElementsByTagName("img");
  var l = images.length;
  for (var i = 0; i < l; i++) {
    images[0].className += "ignore-img";
    console.log("done");
    // images[0].parentNode.removeChild(images[0]);
  }

  var specialElementHandlers = {
    ".ignore-img": function(element, renderer) {
      return true;
    }
  };

  var options = {
    width: 170,
    pagesplit: true,
    elementHandlers: specialElementHandlers
  };

  var pdfName = storyTitle + " " + storyAuthor + ".pdf";

  doc.fromHTML(
    document.getElementById("story-container"),
    15,
    15,
    options,
    function() {
      doc.save(pdfName);
    }
  );
}
