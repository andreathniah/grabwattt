// setup Firebase essential items
// re-base helps to sync state with firebase items in real time
import React from "react";
import * as jsPDF from "jspdf";
import Rebase from "re-base";
import ReactGA from "react-ga";
import Helmet from "react-helmet";
import firebase from "firebase/app";
import "firebase/database";

const firebaseKey = {
	apiKey: process.env.REACT_APP_FIREBASE_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_URL
};
const firebaseApp = firebase.initializeApp(firebaseKey);
const base = Rebase.createClass(firebaseApp.database());

export function deleteExpireStories(dataRef) {
	const now = Date.now();
	const cutoff = now - 8 * 60 * 60 * 1000; // 8 hours
	// const cutoff = now - 2 * 60 * 60 * 1000; // 8 hours
	const old = dataRef
		.orderByChild("timestamp")
		.endAt(cutoff)
		.limitToLast(1);

	old.on("child_added", snapshot => {
		if (snapshot.val().timestamp !== undefined) {
			console.log("old data:", snapshot.key, snapshot.val().timestamp);
			dataRef.child(snapshot.key).remove();
		} else console.log(snapshot.key);
	});
}

// delete progress counter that silently failed aka 15mins
export function deleteCrashedStories(progressRef, queueRef, errorRef) {
	const now = Date.now();
	const cutoff = now - 15 * 60 * 1000; // 15 mins

	const old = progressRef
		.orderByChild("timestamp")
		.endAt(cutoff)
		.limitToLast(1);

	old.on("child_added", snapshot => {
		console.log("old data:", snapshot.key, snapshot.val().timestamp);
		// set variables up for deletion
		progressRef.child(snapshot.key).remove();
		errorRef.child(snapshot.key).set({ errorFound: true });
		queueRef.child(snapshot.key).set({ toDelete: true });
	});
}

// check if child node exists under parent
export function checkExistence(parentRef, child) {
	return parentRef
		.child(child)
		.once("value")
		.then(snapshot => {
			if (snapshot.exists()) return true;
			else return false;
		});
}

// log actions to google analytics
export function logToGA(category, action, label) {
	ReactGA.event({
		category: category,
		action: action,
		label: label
	});
}

// switch page head with appropriate titles
export function getHelmet(data) {
	const description =
		"Download softcopies of Wattpad fiction in HTML and PDF format for free. No login or software download required!";
	return (
		<Helmet defer={false}>
			<title>{data}</title>
			<meta property="description" content={description} />
			<meta property="og:description" content={description} />
			<meta property="og:title" content={data} />
		</Helmet>
	);
}

// generate PDF with page breaks
// https://plnkr.co/edit/64KOSxMgDWfRUfg2bxfo?p=preview
export function generatePDF(storyTitle, storyAuthor) {
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

export { base, firebaseApp, firebaseKey }; // named export
