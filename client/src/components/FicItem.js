import React from "react";

class FicItem extends React.Component {
	render() {
		return <p dangerouslySetInnerHTML={{ __html: this.props.content }} />;
	}
}

export default FicItem;
