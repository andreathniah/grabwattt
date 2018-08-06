import React from "react";
import FicBody from "./FicBody";
import FicHeader from "./FicHeader";
import base from "../base";

class FicMain extends React.Component {
	state = { storybox: [] };

	componentDidMount() {
		this.ref = base.syncState(`story/${this.props.match.params.storyId}`, {
			context: this,
			state: "storybox"
		});
	}

	componentWillUnmount() {
		base.removeBinding(this.ref);
	}

	extractDetails = detail => {
		return Object.entries(this.state.storybox)
			.filter(([key, val]) => key === detail)
			.map(([key, val]) => val)[0];
	};

	render() {
		const { storybox } = this.state;
		const { storyId } = this.props.match.params;
		const storyArr = [];

		const contents = Object.entries(storybox)[1];
		if (typeof contents !== "undefined") {
			contents[1].map(id => {
				for (var i = 0; i < id.length; i++) storyArr.push(id[i]);
			});
		}

		const storyAuthor = this.extractDetails("author");
		const storyTitle = this.extractDetails("title");
		const storySummary = this.extractDetails("summary");
		const storyURL = this.extractDetails("url");

		return (
			<div className="flex-container">
				<FicHeader
					history={this.props.history}
					storyId={storyId}
					storyAuthor={storyAuthor}
					storyTitle={storyTitle}
					storySummary={storySummary}
					storyURL={storyURL}
				/>
				<FicBody storybox={storyArr} />
			</div>
		);
	}
}

export default FicMain;
