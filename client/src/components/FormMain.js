import React from "react";
import FormHeader from "./FormHeader";
import base from "../base";
import { firebaseApp } from "../base";

class FormMain extends React.Component {
	state = { storyId: "", queuebox: [] };

	componentDidMount() {
		this.ref = base.syncState("/queue", {
			context: this,
			state: "queuebox",
			then() {
				this.deleteOld();
			}
		});
	}

	deleteOld = () => {
		console.log("checking timestamp");
		const database = firebaseApp.database().ref("story");
		var now = Date.now();
		var cutoff = now - 168 * 60 * 60 * 1000; // 1 week
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
		queuebox[storyId] = { toDelete: true };
		this.setState({ queuebox: queuebox });
	};

	wattpadURL = React.createRef();
	goToFic = event => {
		event.preventDefault();
		const requestedURL = this.wattpadURL.current.value;
		const validation = this.validateURL(requestedURL);

		if (validation) {
			const storyId = this.grabStoryId(requestedURL);
			this.setState(prevState => ({ storyId: storyId }));

			const database = firebaseApp.database().ref("story/" + storyId);
			database.once("value", snapshot => {
				if (!snapshot.exists()) {
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
				} else {
					this.props.history.push(`/${this.state.storyId}`);
				}
			});
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
							<button type="submit" className="button">
								Go
							</button>
						</div>
					</form>
				</div>
			</div>
		);
	}
}

export default FormMain;
