import React from "react";
import FormGIF from "./FormGIF";
import FormFeedback from "./FormFeedback";

class FormHeader extends React.Component {
	render() {
		return (
			<div className="header">
				<h1>
					<mark>want that wattpad fic?</mark>
				</h1>
				<div>
					<span>
						enter any wattpad <span>chapter URL</span> to start! <br />
						data will be purged after <span>12 hours</span>
					</span>
					<FormGIF />
					<FormFeedback />
					<br />
				</div>
			</div>
		);
	}
}

export default FormHeader;
