import React from "react";
import FormHeader from "./FormHeader";
import DetectAdBlock from "./DetectAdBlock";
import base from "../base";
import { firebaseApp } from "../base";
import ReactGA from "react-ga";

class FormMain extends React.Component {
	state = { storyId: "", url: "", queuebox: [], errorbox: [] };

	componentDidMount() {
		this.ref = base.syncState("/error", {
			context: this,
			state: "errorbox"
		});

		this.ref = base.syncState("/queue", {
			context: this,
			state: "queuebox",
			then() {
				this.deleteQueue();
				this.deleteOld();
			}
		});
	}

	// delete queue and error checkers
	deleteQueue = () => {
		var checker = false;
		const { queuebox, errorbox } = this.state;
		Object.entries(queuebox).map(([key, val]) => {
			if (val.toDelete) {
				console.log("deleting completed queue data...");
				queuebox[key].toDelete = null;
				errorbox[key].errorFound = null;

				checker = true;
			}
		});
		if (checker) {
			this.setState(prevState => ({ queuebox: queuebox }));
		}
	};

	deleteOld = () => {
		console.log("deleting data older than 12 hours...");
		const database = firebaseApp.database().ref("story");
		var now = Date.now();
		var cutoff = now - 8 * 60 * 60 * 1000; // 1 week
		var old = database
			.orderByChild("timestamp")
			.endAt(cutoff)
			.limitToLast(1);

		old.on("child_added", function(snapshot) {
			console.log(snapshot.key, snapshot.val().timestamp);
			database.child(snapshot.key).remove();
		});
	};

	validateURL = requestedURL => {
		const chapterLink = requestedURL.includes("https://www.wattpad.com/"); //ok
		const storyLink = requestedURL.includes("https://www.wattpad.com/story/"); // reject
		const missingHTTTPS = !requestedURL.includes("https://");

		if (storyLink || missingHTTTPS) return false;
		else if (chapterLink) return true;
		else return false;
	};

	grabStoryId = requestedURL => {
		const str = requestedURL.replace("https://www.wattpad.com/", "");
		const storyId = str.split("-")[0];
		return storyId;
	};

	addToQueue = storyId => {
		const queuebox = { ...this.state.queuebox };
		queuebox[storyId] = { toDelete: false };
		this.setState({ queuebox: queuebox });
	};

	postToServer = (requestedURL, storyId) => {
		fetch("/", {
			method: "POST",
			mode: "cors",
			body: JSON.stringify({ url: requestedURL, storyId: storyId }),
			headers: { "Content-Type": "application/json" }
		})
			.then(res => res.json())
			.then(body => {
				this.addToQueue(body.url);
				this.props.history.push(`/${body.url}`);
			})
			.catch(err => {
				console.log(err);
				this.props.history.push(`/${this.state.storyId}`);
			});
	};

	wattpadURL = React.createRef();
	goToFic = event => {
		event.preventDefault();
		const requestedURL = this.wattpadURL.current.value;
		const validation = this.validateURL(requestedURL);

		if (validation) {
			// ensure no multiple clicks are allowed
			if (this.state.url !== requestedURL) {
				const storyId = this.grabStoryId(requestedURL);
				this.setState(prevState => ({ url: requestedURL, storyId: storyId }));

				const database = firebaseApp.database().ref("story/" + storyId);
				database.once("value", snapshot => {
					if (!snapshot.exists()) {
						this.postToServer(requestedURL, storyId);
					} else {
						ReactGA.event({
							category: "flag",
							action: "recurring-story",
							label: "same-story-request",
							value: storyId
						});
						this.props.history.push(`/${storyId}`);
					}
				});
			} else {
				alert("please click only once per story");
			}
		} else alert("looks like something is wrong, is your link a CHAPTER URL?");
	};

	render() {
		return (
			<div className="background">
				<div className="container flex-fullview">
					<form onSubmit={this.goToFic}>
						<FormHeader />
						<div className="input-group">
							<input
								className="form-control"
								type="text"
								ref={this.wattpadURL}
								required
								placeholder="Enter a URL"
							/>
							<span className="input-group-btn">
								<button type="submit" className="button">
									Go
								</button>
							</span>
						</div>
					</form>
				</div>
				<DetectAdBlock />
			</div>
		);
	}
}

export default FormMain;
