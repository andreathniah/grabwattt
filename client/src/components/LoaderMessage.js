import React from "react";
import { base, logToGA } from "../helpers";

class LoaderMessage extends React.Component {
	state = { progressbox: [], loading: true, error: false };

	componentDidMount() {
		const { storyId } = this.props;

		this.ref = base.syncState(`progress/${storyId}`, {
			context: this,
			state: "progressbox",
			then() {
				this.setState(prevState => ({ loading: false }));
			}
		});

		this.ref = base.syncState(`error/${storyId}/errorFound`, {
			context: this,
			state: "error"
		});
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	handleHome = () => {
		logToGA("error", "redirection", "story-extraction-failed");
		this.props.history.push("/");
	};

	render() {
		const { progressbox, loading, error } = this.state;
		const { storyId } = this.props;

		let message;
		if (loading && !error) message = `Fetching story id: ${storyId}...`;
		else if (!loading && !error) {
			if (progressbox.current === undefined || progressbox.total === undefined)
				message = `Fetching story id: ${storyId}...`;
			else
				message = `Extracting ${progressbox.current} of ${
					progressbox.total
				} chapters...`;
		} else message = "Oops, something went wrong. Try again!";

		return (
			<div className="flex-fullview">
				<p className="loader-message">{message}</p>
				{error ? (
					<button type="button" className="button" onClick={this.handleHome}>
						Return home
					</button>
				) : null}
			</div>
		);
	}
}

export default LoaderMessage;
