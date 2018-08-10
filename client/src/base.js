import Rebase from "re-base";
import firebase from "firebase/app";
import "firebase/database";
import { firebaseConfig } from "./secret";

const firebaseKey = firebaseConfig;
const firebaseApp = firebase.initializeApp(firebaseKey);

const base = Rebase.createClass(firebaseApp.database());

export { firebaseApp }; // named export
export { firebaseKey }; // named export
export default base; // default export
