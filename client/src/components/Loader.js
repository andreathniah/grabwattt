import React from "react";
import LoaderMessage from "./LoaderMessage";
import FicMain from "./FicMain";
import base from "../base";

class Loader extends React.Component {
	state = { loading: true, storybox: [], queuebox: [] };

	componentDidMount() {
		this.ref = base.syncState(`story/${this.props.match.params.storyId}`, {
			context: this,
			state: "storybox"
		});

		this.ref = base.syncState(`queue/${this.props.match.params.storyId}`, {
			context: this,
			state: "queuebox",
			then() {
				const timerId = setTimeout(() => {
					var { queuebox, storybox } = this.state;
					if (
						Object.keys(queuebox).length === 0 &&
						Object.keys(storybox).length === 0
					) {
						console.log("redirecting");
						this.props.history.push("/error404");
					} else {
						queuebox = " ";
					}
				}, 1000);
			}
		});
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	componentDidUpdate() {
		const { loading, storybox } = this.state;

		if (loading === true && Object.keys(storybox).length !== 0) {
			this.setState(prevState => ({ loading: false }));
		}
	}

	render() {
		const { loading, queuebox } = this.state;
		const { match, history } = this.props;

		return (
			<div>
				{loading ? (
					<LoaderMessage storyId={match.params.storyId} />
				) : (
					<FicMain storyId={match.params.storyId} history={history} />
				)}
			</div>
		);
	}
}

export default Loader;
