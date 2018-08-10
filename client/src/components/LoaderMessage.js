import React from "react";
import base from "../base";

class LoaderMessage extends React.Component {
	state = { progressbox: [], loading: true };

	componentDidMount() {
		const { storyId } = this.props;

		this.ref = base.syncState(`progress/${storyId}`, {
			context: this,
			state: "progressbox",
			then() {
				this.setState(prevState => ({ loading: false }));
			}
		});
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	render() {
		const { progressbox, loading } = this.state;
		const { storyId } = this.props;
		var message = null;

		if (loading) {
			message = `Fetching story id: ${storyId}...`;
		} else {
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
			</div>
		);
	}
}

export default LoaderMessage;
