import Rebase from "re-base";
import firebase from "firebase";

const firebaseKey = {
	apiKey: "AIzaSyDVAp4x8NHKEEjPxZeYVWAJ1yoW-und2QM",
	authDomain: "download-wattpad-fic.firebaseapp.com",
	databaseURL: "https://download-wattpad-fic.firebaseio.com"
};
const firebaseApp = firebase.initializeApp(firebaseKey);

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp }; // named export
export { firebaseKey }; // named export
export default base; // default export
