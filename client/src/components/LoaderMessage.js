import React from "react";
import { Button } from "react-bootstrap";
import { base, logToGA } from "../helpers";
import "../styles-spinners.css";

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

	getMessage = (storyId, progressbox, loading, error) => {
		if (loading && !error) return `Fetching story id: ${storyId}...`;
		else if (!loading && !error) {
			if (progressbox.current === undefined || progressbox.total === undefined)
				return `Fetching story id: ${storyId}...`;
			else
				return `Extracting ${progressbox.current} of ${
					progressbox.total
				} chapters...`;
		} else return "Oops, something went wrong. Try again!";
	};

	render() {
		const { progressbox, loading, error } = this.state;
		const { storyId } = this.props;

		const spinners = (
			<div className="sk-cube-grid">
				<div className="sk-cube sk-cube1" />
				<div className="sk-cube sk-cube2" />
				<div className="sk-cube sk-cube3" />
				<div className="sk-cube sk-cube4" />
				<div className="sk-cube sk-cube5" />
				<div className="sk-cube sk-cube6" />
				<div className="sk-cube sk-cube7" />
				<div className="sk-cube sk-cube8" />
				<div className="sk-cube sk-cube9" />
			</div>
		);

		return (
			<div className="loader-main">
				<div>
					{spinners}
					<p className="loader-message">
						{this.getMessage(storyId, progressbox, loading, error)}
					</p>
					{error ? (
						<Button bsStyle="primary" onClick={this.handleHome}>
							Return Home
						</Button>
					) : null}
				</div>
			</div>
		);
	}
}

export default LoaderMessage;
