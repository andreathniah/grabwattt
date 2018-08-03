import React from "react";
import FicItem from "./FicItem";

class FicBody extends React.Component {
	render() {
		var i = 0;
		const storyItem = this.props.storybox.map(key => (
			<FicItem key={i++} content={key} />
		));

		return (
			<div id="story-container" className="print-container">
				{storyItem}
			</div>
		);
	}
}

export default FicBody;
