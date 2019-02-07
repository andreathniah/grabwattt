import React from "react";
import FormGIF from "./FormGIF";
import FormGithub from "./FormGithub";

class FormHeader extends React.Component {
	render() {
		return (
			<div className="header">
				<h1>
					<mark>grabwatt in different language?</mark>
				</h1>
				<div>
					<span>
						this a <span>temporary</span> site to accomodate to stories with
						unique characters.
						<br />
						<span>
							<strong>DO NOT SHARE THIS LINK.</strong>
						</span>
					</span>
					<br />
					<br />
				</div>
			</div>
		);
	}
}

export default FormHeader;
