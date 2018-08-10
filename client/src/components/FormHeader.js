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
					<span>
						enter any wattpad <span>chapter URL</span> to start!
					</span>
					<FormGIF />
					<br />
				</div>
			</div>
		);
	}
}

export default FormHeader;
