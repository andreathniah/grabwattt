import React from "react";

class FormHeader extends React.Component {
	render() {
		return (
			<div className="header">
				<h1>
					<mark>want that wattpad fic?</mark>
				</h1>
				<p>
					enter any wattpad <span>chapter</span> URL to start!
				</p>
			</div>
		);
	}
}

export default FormHeader;
