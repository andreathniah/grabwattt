import React from "react";
import {
	base,
	firebaseApp,
	logToGA,
	checkExistence,
	getHelmet
} from "../helpers";
import FormBody from "./FormBody";
import FormHeader from "./FormHeader";

class FormMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = { status: true, errorbox: [], queuebox: [] };
	}

	// sync firebase values upon site load
	componentDidMount = () => {
		this.ref = base.syncState("/error", {
			context: this,
			state: "errorbox"
		});

		this.ref = base.syncState("/queue", {
			context: this,
			state: "queuebox",
			then() {
				this.deleteErrorCheckers();
				// this.deleteOld();
				// this.deleteSilentCrash();
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
				// add storyId to queuebox
				const queuebox = { ...this.state.queuebox };
				queuebox[body.url] = { toDelete: false };
				this.setState({ queuebox: queuebox });
				this.props.history.push(`/${body.url}`);
			})
			.catch(err => {
				console.log(err);
				this.props.history.push(`/${storyId}`);
			});
	};

	// submit action called by child component
	handleSubmit = data => {
		const { status } = this.state;
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
					console.log(result);
					if (result[0]) {
						console.log("story already exists");
						logToGA("flag", "redirection", "story-already-available");
						this.props.history.push(`/${storyId}`);
					} else if (!result[1] && !result[2]) {
						console.log("start extracting story");
						logToGA("flag", "request", "request-story-extraction");
						this.postToServer(data, storyId);
					} else {
						console.log("same story requested, redirecting...");
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
				console.log("StoryId:", storyId);
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
			</div>
		);
	}
}

export default FormMain;
