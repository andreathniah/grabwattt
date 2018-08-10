// const firebaseConfig = {
// 	apiKey: "AIzaSyDVAp4x8NHKEEjPxZeYVWAJ1yoW-und2QM",
// 	authDomain: "download-wattpad-fic.firebaseapp.com",
// 	databaseURL: "https://download-wattpad-fic.firebaseio.com"
// };
require("dotenv").config();

const firebaseConfig = {
	apiKey: process.env.REACT_APP_FIREBASE_KEY,
	authDomain: process.env.REACT_APP_FIREBASE_DOMAIN,
	databaseURL: process.env.REACT_APP_FIREBASE_URL
};

exports.firebaseKey = firebaseConfig;
