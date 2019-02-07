import React from "react";
import { FormGroup, FormControl, Button } from "react-bootstrap";

class FormBody extends React.Component {
	constructor(props) {
		super(props);
		this.state = { url: "" };
	}

	handleClick = () => {
		this.props.handleSubmit(this.state.url);
	};

	handleChange = event => {
		this.setState({ url: event.target.value });
	};

	// validation logic, returns an object of variables
	// need to have regex where https://www.wattpad.com/<number> would equal to true
	validateURL = () => {
		const { url } = this.state;

		const requestedURL = url.trim();
		const chapterLink = requestedURL.startsWith("https://www.wattpad.com/"); //ok
		const storyLink = requestedURL.startsWith("https://www.wattpad.com/story/"); // reject
		const authorLink = requestedURL.startsWith("https://www.wattpad.com/user/"); // reject
		const missingHTTTPS = !requestedURL.startsWith("https://");
		const userWorks = requestedURL.includes("/myworks/"); // reject

		// prettier-ignore
		return { storyLink, missingHTTTPS, authorLink, userWorks, chapterLink };
	};

	// validation to get appropriate bootstrap colors
	getValidationState() {
		// prettier-ignore
		const { storyLink, missingHTTTPS, authorLink, userWorks, chapterLink } = this.validateURL();
		const { url } = this.state;

		if (url.length > 0) {
			if (storyLink || missingHTTTPS || authorLink || userWorks) return "error";
			else if (chapterLink) return "success";
			else return "error";
		} else return null;
	}

	// validation to get appropriate warning message
	getWarningMsg = () => {
		// prettier-ignore
		const { storyLink, missingHTTTPS, authorLink, userWorks, chapterLink } = this.validateURL();
		const { url } = this.state;

		if (url.length > 0) {
			let message;
			if (storyLink || missingHTTTPS || authorLink || userWorks)
				message = "woosp, this link doesn't look like its a chapter URL!";
			else if (chapterLink) message = "";
			else
				message = "woosp authors, please use your story's public URL instead!";

			return message;
		} else return null;
	};

	render() {
		const { url } = this.state;
		const { status } = this.props;

		// disable submit button when link is invalid
		const validity = this.getWarningMsg();

		return (
			<React.Fragment>
				<FormGroup
					className="form-body"
					validationState={this.getValidationState()}
				>
					<FormControl
						type="text"
						value={url}
						placeholder="https://www.wattpad.com/"
						onChange={this.handleChange}
					/>
					<Button
						bsStyle="primary"
						onClick={this.handleClick}
						disabled={
							!status ||
							url.length === 0 ||
							(validity !== null && validity.length > 0)
						}
					>
						Go
					</Button>
				</FormGroup>
				<span className="form-body-help">{this.getWarningMsg()}</span>
			</React.Fragment>
		);
	}
}

export default FormBody;
