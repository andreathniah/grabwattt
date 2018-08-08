import React from "react";
import FormGIF from "./FormGIF";

class FormHeader extends React.Component {
	render() {
		return (
			<div className="header">
				<h1>
					<mark>want that wattpad fic?</mark>
				</h1>
				<div>
					enter any wattpad <span>chapter URL</span> to start!
					<FormGIF />
					<br />
				</div>
			</div>
		);
	}
}

export default FormHeader;
