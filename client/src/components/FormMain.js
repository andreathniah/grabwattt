import React from "react";
import { base, firebaseApp, logToGA } from "../helpers";
import FormBody from "./FormBody";

class FormMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = { status: false, errorbox: [], queuebox: [] };
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
				// this.deleteQueue();
				// this.deleteOld();
				// this.deleteSilentCrash();
			}
		});
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

				// this.props.history.push(`/${body.url}`);
			})
			.catch(err => {
				console.log(err);
				// this.props.history.push(`/${this.state.storyId}`);
			});
	};

	// submit action called by child component
	handleSubmit = data => {
		const { status } = this.state;
		this.setState({ status: !status });

		// promise based method to find storyId
		this.grabStoryId(data).then(storyId => {
			console.log("storyId", storyId);
			const database = firebaseApp.database().ref("/");
			database.child(`story/${storyId}`).once("value", snapshot => {
				if (!snapshot.exists()) {
					database.child(`progress/${storyId}`).once("value", snapshot => {
						if (!snapshot.exists()) {
							database.child(`queue/${storyId}`).once("value", snapshot => {
								if (!snapshot.exists()) {
									// new request for story
									logToGA("flag", "request", "request-story-extraction");
									this.postToServer(data, storyId);
								} else {
									// story extraction in progress
									logToGA("flag", "redirection", "same-story-request");
									// this.props.history.push(`/${storyId}`);
								}
							});
						} else {
							// story extraction in progress
							logToGA("flag", "redirection", "same-story-request");
							// this.props.history.push(`/${storyId}`);
						}
					});
				} else {
					// story is already available
					logToGA("flag", "redirection", "story-already-available");
					// this.props.history.push(`/${storyId}`);
				}
			});
		});
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
		return (
			<React.Fragment>
				<FormBody {...this.state} handleSubmit={this.handleSubmit} />
			</React.Fragment>
		);
	}
}

export default FormMain;
