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
					if (Object.keys(this.state.queuebox).length === 0) {
						this.props.history.push("/error404");
					} else {
						this.state.queuebox = null;
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
					<FicMain
						storyId={match.params.storyId}
						history={history}
						queuebox={queuebox}
					/>
				)}
			</div>
		);
	}
}

export default Loader;
