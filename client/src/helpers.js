// setup Firebase essential items
// re-base helps to sync state with firebase items in real time

import Rebase from "re-base";
import ReactGA from "react-ga";
import firebase from "firebase/app";
import "firebase/database";

const firebaseKey = {
	apiKey: process.env.REACT_APP_FIREBASE_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_URL
};
const firebaseApp = firebase.initializeApp(firebaseKey);
const base = Rebase.createClass(firebaseApp.database());

// log actions to google analytics
export function logToGA(category, action, label) {
	ReactGA.event({
		category: category,
		action: action,
		label: label
	});
}

export { base, firebaseApp, firebaseKey }; // named export
