import React from "react";
import FicItem from "./FicItem";

class FicChapter extends React.Component {
	render() {
		var i = 0;
		const storyItem = this.props.storybox.map(key => (
			<FicItem key={i++} content={key} />
		));

		return <div className="page">{storyItem}</div>;
	}
}

export default FicChapter;
