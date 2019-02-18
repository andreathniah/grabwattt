const firebase = require("firebase");
const generalHelpers = require("./generalHelpers");
require("firebase/database");

// firebase configurations
const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_URL
};
if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const db = firebase.database();

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
	generalHelpers.analytics
		.event("flag", "request", "server-extraction-successful")
		.send();

	return storyId;
};

// general house-keeping to empty database workbin
onStartDeletion = () => {
	console.log("[ONSTART] Deleting all entries at Firebase...");
	// db.ref("progress").once("value", snapshot => {
	// 	snapshot.forEach(childSnapshot => logError(childSnapshot.key));
	// });
	db.ref("progress").remove();
	db.ref("error").remove();
	db.ref("queue").remove();
};

// update chapter progress counter of the story
updateProgress = async (storyId, counter, total) => {
	const progressRef = db.ref("progress/" + storyId);
	const queueRef = db.ref("queue/" + storyId);

	queueRef.set({ toDelete: false });
	progressRef.update({ current: counter, total: total, timestamp: Date.now() });
};

// delete progress and flag for deletion when extraction is completed
deleteProgress = storyId => {
	const progressRef = db.ref("progress/" + storyId);
	const queueRef = db.ref("queue/" + storyId);
	queueRef.set({ toDelete: true });
	progressRef.set({ current: null, total: null, timestamp: null });
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
	generalHelpers.analytics
		.event("flag", "request", "server-extraction-failed")
		.send();
};

module.exports = {
	onStartDeletion: onStartDeletion,
	saveToFirebase: saveToFirebase,
	updateProgress: updateProgress,
	deleteProgress: deleteProgress,
	logError: logError
};
