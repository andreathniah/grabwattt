import React from "react";
import FicHeader from "./FicHeader";
import FicChapter from "./FicChapter";
import base from "../base";

class FicMain extends React.Component {
	state = { storybox: [] };

	componentDidMount() {
		this.ref = base.syncState(`story/${this.props.storyId}`, {
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
		const { storyId } = this.props;

		const contents = Object.entries(storybox)[1];
		if (typeof contents !== "undefined") {
			var i = 0;
			var storyChapter = contents[1].map(id => {
				return <FicChapter key={i++} storybox={id} />;
			});
		}

		const storyAuthor = this.extractDetails("author");
		const storyTitle = this.extractDetails("title");
		const storySummary = this.extractDetails("summary");
		const storyURL = this.extractDetails("url");

		return (
			<div className="container">
				<FicHeader
					history={this.props.history}
					storyId={storyId}
					storyAuthor={storyAuthor}
					storyTitle={storyTitle}
					storySummary={storySummary}
					storyURL={storyURL}
				/>
				<div id="story-container" className="print-container">
					{storyChapter}
				</div>
			</div>
		);
	}
}

export default FicMain;
