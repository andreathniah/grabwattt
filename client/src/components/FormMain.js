import React from "react";
import {
	base,
	firebaseApp,
	logToGA,
	checkExistence,
	deleteExpireStories,
	getHelmet,
	deleteCrashedStories
} from "../helpers";
import FormBody from "./FormBody";
import FormHeader from "./FormHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FormMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = { status: true, errorbox: [], queuebox: [] };
	}

	// sync firebase values upon site load
	componentDidMount = () => {
		const alertMsg1 =
			"Grabwatt is running on a new algorithm that would hopefully reduce the amount of error rates! Do log a feedback if you notice something wrong!";
		const alertMsg2 =
			"Grabwatt's database is experiencing some issues with storiing stories for 8hours, as a precaution, please download your story immediately after extraction completes.";
		toast(alertMsg2, { autoClose: 12000 });
		toast(alertMsg1, { autoClose: 10000 });

		this.ref = base.syncState("/error", {
			context: this,
			state: "errorbox"
		});

		this.ref = base.syncState("/queue", {
			context: this,
			state: "queuebox",
			then() {
				const storyRef = firebaseApp.database().ref("story");
				const progressRef = firebaseApp.database().ref("progress");
				const queueRef = firebaseApp.database().ref("queue");
				const errorRef = firebaseApp.database().ref("error");

				deleteExpireStories(storyRef);
				deleteCrashedStories(progressRef, queueRef, errorRef);
				this.deleteErrorCheckers();
			}
		});
	};

	// delete queue and error checkers after extraction process
	deleteErrorCheckers = () => {
		let checker = false;
		const { queuebox, errorbox } = this.state;

		Object.entries(queuebox).map(([key, val]) => {
			if (val.toDelete) {
				queuebox[key].toDelete = null;
				errorbox[key].errorFound = null;
				checker = true;
			}
		});
		if (checker) {
			this.setState(prevState => ({ queuebox, errorbox }));
		}
	};

	postToServer = (url, storyId) => {
		fetch("/", {
			method: "POST",
			mode: "cors",
			body: JSON.stringify({ url: url, storyId: storyId }),
			headers: { "Content-Type": "application/json" }
		})
			.then(res => res.json())
			.then(body => {
				// add storyId to queuebox and errorbox
				const queuebox = { ...this.state.queuebox };
				queuebox[body.url] = { toDelete: false };
				this.setState({ queuebox });
				this.props.history.push(`/${body.url}`);
			})
			.catch(err => {
				console.log(err);
				this.props.history.push(`/${storyId}`);
			});
	};

	// submit action called by child component
	handleSubmit = data => {
		this.setState({ status: false });

		// promise based method to find storyId
		this.grabStoryId(data)
			.then(storyId => {
				console.log("storyId", storyId);
				const database = firebaseApp.database().ref("/");

				Promise.all([
					checkExistence(database, `story/${storyId}`),
					checkExistence(database, `progress/${storyId}`),
					checkExistence(database, `queue/${storyId}`)
				]).then(result => {
					if (result[0]) {
						// story already exist
						logToGA("flag", "redirection", "story-already-available");
						this.props.history.push(`/${storyId}`);
					} else if (!result[1] && !result[2]) {
						// new story request
						logToGA("flag", "request", "request-story-extraction");
						this.postToServer(data, storyId);
					} else {
						// same story request
						logToGA("flag", "redirection", "same-story-request");
						this.props.history.push(`/${storyId}`);
					}
				});
			})
			.catch(error => this.setState({ status: true }));
	};

	// fetching plain HTML to isolate storyId from dropdownlist
	grabStoryId = url => {
		return fetch(url)
			.then(results => results.text())
			.then(data => {
				const parser = new DOMParser();
				const httpDoc = parser.parseFromString(data, "text/html");
				const storyLink = httpDoc
					.querySelector("div.toc-header.text-center")
					.querySelector("a.on-navigate")
					.getAttribute("href");
				return storyLink;
			})
			.then(link => {
				const str = link.split("-")[0];
				const storyId = str.split("/")[2];
				if (isNaN(storyId)) return this.grabChapterId(url);
				else return storyId;
			})
			.catch(error => {
				console.log(error);
				console.log("Grabbing temp storyId...");
				return this.grabChapterId(url);
			});
	};

	// fall back of grabStoryId()
	// grab chapterId from url instead of storyId
	grabChapterId = url => {
		const str = url.replace("https://www.wattpad.com/", "");
		const chapterId = str.split("-")[0];
		return chapterId;
	};

	render() {
		const FormFeedback = (
			<a href="#" onClick={() => this.props.history.push("/feedback")}>
				<span>feedbacks or complains? shoot me a text!</span>
			</a>
		);

		return (
			<div className="form-main grabwatt-background">
				{getHelmet("Grabwatt - Wattpad Softcopies Downloader")}
				<div>
					<FormHeader />
					<FormBody {...this.state} handleSubmit={this.handleSubmit} />
				</div>
				<div className="form-feedback">{FormFeedback}</div>
				<ToastContainer />
			</div>
		);
	}
}

export default FormMain;
