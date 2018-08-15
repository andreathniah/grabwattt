import React from "react";
import base from "../base";

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
		this.props.history.push("/");
	};

	render() {
		const { progressbox, loading, error } = this.state;
		const { storyId } = this.props;
		var message = null;

		if (loading && error === false) {
			message = `Fetching story id: ${storyId}...`;
		} else if (loading === false && error === false) {
			if (
				progressbox.current === undefined ||
				progressbox.total === undefined
			) {
				message = `Fetching story id: ${storyId}...`;
			} else {
				message = `Extracting ${progressbox.current} of ${
					progressbox.total
				} chapters...`;
			}
		} else {
			message = "Oops, something went wrong. Try again!";
		}

		return (
			<div className="flex-fullview">
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
