import React from "react";
import base from "../base";

class FormMessage extends React.Component {
	state = { progressbox: [] };

	componentDidMount() {
		this.ref = base.syncState(`progress/`, {
			context: this,
			state: "progressbox"
		});
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	filterProgress = () => {
		const { progressbox } = this.state;
		const { storyId } = this.props;
		var current = null,
			total = null,
			noise = null,
			values = null;

		const hello = Object.entries(progressbox)
			.filter(([key, val]) => key === storyId)
			.map(([key, val]) => val)[0];

		if (typeof hello !== "undefined") {
			current = Object.entries(hello)
				.filter(([key, val]) => key === "current")
				.map(([key, val]) => val)[0];
			total = Object.entries(hello)
				.filter(([key, val]) => key === "total")
				.map(([key, val]) => val)[0];
			noise = Object.entries(hello)
				.filter(([key, val]) => key === "noise")
				.map(([key, val]) => val)[0];
		}

		values = { current: current, total: total, noise: noise };
		return values;
	};

	render() {
		const values = this.filterProgress();
		const { current, total, noise } = values;

		const message = !(current === null && total === null)
			? `Extracting ${current} of ${total} chapters...`
			: "Loading...";

		return (
			<div>
				<p>{message}</p>
				{console.log(noise)}
			</div>
		);
	}
}

export default FormMessage;
