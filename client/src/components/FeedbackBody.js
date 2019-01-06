import React from "react";
import {
	FormGroup,
	FormControl,
	ControlLabel,
	Button,
	ToggleButton,
	ButtonToolbar,
	ToggleButtonGroup
} from "react-bootstrap";

class FeedbackBody extends React.Component {
	constructor(props) {
		super(props);
		this.state = { email: "", message: "", thumb: "", status: true };
	}

	// disable submit button
	// redirect form data to google spreadsheet and email
	handleClick = () => {
		let { email, message, thumb } = this.state;
		this.setState({ status: false });

		const scriptURL = process.env.REACT_APP_SPREADSHEET_URL;
		const method = "POST";
		const body = new FormData(this.form);
		fetch(scriptURL, { method, body })
			.then(res => {
				alert(
					"Thank you for leaving us with a feedback! Check your email for replies within a week!"
				);
				email = message = thumb = "";
				this.setState({ email, message, thumb, status: true }, () => {
					this.props.history.push("/");
				});
			})
			.catch(error => this.setState({ status: true }));
	};

	handleChange = opcode => event => {
		if (opcode !== "thumb") this.setState({ [opcode]: event.target.value });
		else this.setState({ [opcode]: event });
	};

	getValidationState = opcode => {
		const { email, message, thumb } = this.state;
		if (
			email.trim().length > 0 ||
			message.trim().length > 0 ||
			thumb.trim().length > 0
		) {
			if (
				(opcode === "message" && message.length === 0) ||
				(opcode === "thumb" && thumb.length === 0) ||
				(opcode === "email" && (email.length === 0 || !email.includes("@")))
			)
				return "error";
			else return "success";
		} else return null;
	};

	render() {
		const { email, message, thumb, status } = this.state;

		// allow button to be clicked only when all fields are input
		const validity =
			!(
				this.getValidationState("message") || this.getValidationState("email")
			) ||
			(this.getValidationState("message") === "error" ||
				this.getValidationState("email") === "error") ||
			thumb.length === 0 ||
			!status
				? true
				: false;

		return (
			<form className="gform" ref={el => (this.form = el)}>
				<FormGroup validationState={this.getValidationState("thumb")}>
					<ControlLabel>Experience</ControlLabel>
					<ButtonToolbar>
						<ToggleButtonGroup
							onChange={this.handleChange("thumb")}
							type="radio"
							name="thumb"
						>
							<ToggleButton value={"up"}>
								<span role="img" aria-label="thumbs-up">
									&#128077;
								</span>
							</ToggleButton>
							<ToggleButton value={"down"}>
								<span role="img" aria-label="thumbs-down">
									&#128078;
								</span>
							</ToggleButton>
						</ToggleButtonGroup>
					</ButtonToolbar>
				</FormGroup>

				<FormGroup validationState={this.getValidationState("message")}>
					<ControlLabel>Message</ControlLabel>
					<FormControl
						type="text"
						name="message"
						value={message}
						onChange={this.handleChange("message")}
						placeholder="Add the story URL link if you need me to debug something!"
						componentClass="textarea"
					/>
				</FormGroup>
				<FormGroup validationState={this.getValidationState("email")}>
					<ControlLabel>Email</ControlLabel>
					<FormControl
						type="email"
						name="email"
						value={email}
						onChange={this.handleChange("email")}
						placeholder="Check your email within a week for my reply!"
					/>
				</FormGroup>
				<Button
					bsStyle="warning"
					onClick={this.handleClick}
					disabled={validity}
				>
					Go
				</Button>
			</form>
		);
	}
}

export default FeedbackBody;
