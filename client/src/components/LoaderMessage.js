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

		const message = loading
			? `Fetching story id: ${storyId}...`
			: `Extracting ${progressbox.current} of ${progressbox.total} chapters...`;

		return (
			<div>
				<p>{message}</p>
			</div>
		);
	}
}

export default LoaderMessage;
