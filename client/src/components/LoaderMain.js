import React from "react";
import { base, firebaseApp, logToGA, checkExistence } from "../helpers";
import FicMain from "./FicMain";
import LoaderMessage from "./LoaderMessage";

class LoaderMain extends React.Component {
	constructor(props) {
		super(props);
		this.state = { storybox: [], loading: true };
	}

	componentDidMount = () => {
		const { storyId } = this.props.match.params;

		this.ref = base.syncState(`story/${storyId}`, {
			context: this,
			state: "storybox",
			then() {
				const queueRef = firebaseApp.database().ref("queue");
				const storyRef = firebaseApp.database().ref("story");
				const progressRef = firebaseApp.database().ref("progress");
				const errorRef = firebaseApp.database().ref("error/" + storyId);

				// wait for all async function to finish before evaluating
				Promise.all([
					checkExistence(progressRef, storyId),
					checkExistence(queueRef, storyId),
					checkExistence(storyRef, storyId)
				]).then(result => {
					if (result.every(item => !item)) {
						logToGA("error", "redirection", "story-not-found");
						errorRef.set({ errorFound: null });
						this.props.history.push("/error");
					}
				});
			}
		});
	};

	componentWillUnmount = () => {
		base.removeBinding(this.ref);
	};

	componentDidUpdate() {
		const { loading, storybox } = this.state;

		if (loading && Object.keys(storybox).length !== 0) {
			this.setState(prevState => ({ loading: false }));
		}
	}

	render() {
		const { storybox, loading } = this.state;
		const { storyId } = this.props.match.params;

		return (
			<div>
				{loading ? (
					<LoaderMessage {...this.state} {...this.props} storyId={storyId} />
				) : (
					<FicMain {...this.props} storybox={storybox} />
				)}
			</div>
		);
	}
}

export default LoaderMain;
