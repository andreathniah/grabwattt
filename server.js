require("dotenv").config();

const fs = require("fs");
const cors = require("cors");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const puppeteer = require("puppeteer");
const firebase = require("firebase");
const Epub = require("epub-gen");
require("firebase/database");

var secretKey = require("./secret.js");

// express configurations
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

if (process.env.NODE_ENV === "production") {
  // Serve any static files
  app.use(express.static(path.join(__dirname, "client/build")));
  // Handle React routing, return all requests to React app
  app.get("*", function(req, res) {
    res.sendFile(path.join(__dirname, "client/build", "index.html"));
  });
}
app.listen(port, () => console.log(`Listening on port ${port}`));

// firebase configurations
if (!firebase.apps.length) {
  firebase.initializeApp(secretKey.firebaseKey);
}
const db = firebase.database();

app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true
  })
);

app.post("/", (req, res) => {
  let requestedURL = req.body.url;
  let storyId = req.body.storyId;

  console.log("requestedURL: ", requestedURL);
  promise = startScraping(requestedURL, storyId);
  promise
    .then(key => {
      if (key) deleteProgress(storyId);
    })
    .catch(err => {
      logError(storyId);
      console.log(err);
    });
  res.send({ url: storyId });
});

app.post("/pdf", (req, res) => {
  let pdfURL = req.body.url;
  const promise = startPDF(pdfURL);
  promise
    .then(buffer => {
      res.type("application/pdf");
      res.send(buffer);
    })
    .catch(err => console.log(err));
});

app.post("/epub", (req, res) => {
  let epubURL = req.body.url;
  let epubTitle = req.body.title;
  let epubAuthor = req.body.author;
  let epubSummary = req.body.summary;
  let epubContent = req.body.content;

  const escapedTitle = epubTitle.replace(/[/]/g, "");
  const fileName = `archive/${escapedTitle}.epub`;

  const option = {
    title: epubTitle, // *Required, title of the book.
    author: epubAuthor, // *Required, name of the author.
    content: [
      { title: epubTitle, author: epubAuthor, data: epubSummary },
      { title: "Story", data: epubContent }
    ]
  };

  // create directory if not available
  const dir = "./archive";
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const promise = new Promise((resolve, reject) => {
    new Epub(option, fileName).promise
      .then(() => {
        resolve(true);
        console.log("[EPUB] Success => Id: ", epubURL, "\n");
      })
      .catch(err => {
        reject(err);
      });
  });
  promise.then(
    status => {
      const file = __dirname + `/${fileName}`;
      res.download(file, "report.pdf", err => {
        if (!err) {
          setTimeout(() => {
            fs.unlink(fileName, err => {
              if (!err) console.log("Local image deleted");
              else console.log(err);
            });
          }, 3000);
        }
      });
    },
    error => {
      console.log(error);
    }
  );
});

startPDF = async pdfURL => {
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
  await page.waitForSelector(".page");

  console.log("pdfURL: ", pdfURL);

  const buffer = await page.pdf({
    format: "A4",
    margin: { left: "2cm", top: "2.5cm", right: "2cm", bottom: "2.5cm" }
  });

  console.log("[PDF] Success => Id: ", pdfURL, "\n");

  pdfBrowser.close();
  return buffer;
};

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

// scroll page to the end of the chapter
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

// creates a global variable of browser on server start to reduce memory
(async () => {
  browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage"
    ]
  });

  console.log("[ONSTART] Chrome browser started");
})();

// create a new page and start scraping materials
startScraping = async (requestedURL, storyId) => {
  const page = await browser.newPage();
  await page.setExtraHTTPHeaders({ Referer: "https://www.wattpad.com" });
  await page.goto(requestedURL);

  try {
    // grab miscellaneous details
    const storyTitle = await page.evaluate(extractTitle);
    const storyAuthor = await page.evaluate(extractAuthor);
    const chapterURL = await page.evaluate(extractChapters);
    const landingURL = await page.evaluate(extractLink); // find link to summary page
    const story = [];

    // grab every chapter's content
    var count = 0;

    for (let url of chapterURL) {
      const updatedURL = "https://www.wattpad.com" + url;
      await page.goto(updatedURL);
      await autoScroll(page);
      const items = await page.evaluate(extractContent);
      story.push(items);
      console.log(updatedURL);
      updateProgress(storyId, ++count, chapterURL.length);
    }

    const summaryURL = "https://www.wattpad.com" + landingURL;
    await page.goto(summaryURL);
    const storySummary = await page.evaluate(extractSummary);
    console.log("summaryURL: ", summaryURL);

    page.on("error", err => {
      page.goto("about:blank");
      page.close();
      logError(storyId);
      console.log(err);
    });

    const storyKey = saveToFirebase(
      story,
      storyTitle,
      storyAuthor,
      storySummary,
      summaryURL,
      storyId
    );

    await page.goto("about:blank");
    await page.close();
    return storyKey;
  } catch (err) {
    await page.goto("about:blank");
    await page.close();
    logError(storyId);
    console.log(err);
  }
};

// update chapter progress counter of the story
updateProgress = async (storyId, counter, total) => {
  const progressRef = db.ref("progress/" + storyId);
  progressRef.update({ current: counter, total: total, timestamp: Date.now() });
};

// delete progress and flag for error and deletion error occurs
logError = async storyId => {
  const errorRef = db.ref("error/" + storyId);
  const queueRef = db.ref("queue/" + storyId);
  const progressRef = db.ref("progress/" + storyId);

  errorRef.set({ errorFound: true });
  queueRef.set({ toDelete: true });
  progressRef.set({ current: null, total: null, timestamp: null });
  console.log("[ERROR] Closing page =>", storyId);
};

// delete progress and flag for deletion when extraction is completed
deleteProgress = storyId => {
  const progressRef = db.ref("progress/" + storyId);
  const queueRef = db.ref("queue/" + storyId);
  queueRef.set({ toDelete: true });
  progressRef.set({ current: null, total: null, timestamp: null });
};

// commit extracted contents to firebase on on success
let saveToFirebase = (
  story,
  storyTitle,
  storyAuthor,
  storySummary,
  storyURL,
  storyId
) => {
  const storyRef = db.ref("story/" + storyId);
  storyRef.set({
    title: storyTitle,
    author: storyAuthor,
    pages: story,
    summary: storySummary,
    url: storyURL,
    timestamp: Date.now()
  });

  console.log("[STORY] Success => Id: ", storyId, "\n");
  return storyId;
};
