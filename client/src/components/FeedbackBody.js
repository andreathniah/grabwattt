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
		this.state = { email: "", message: "", thumb: "" };
	}

	handleClick = () => {
		console.log("start submitting to both gmail and spreadsheet");
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
				(opcode === "email" && email.length === 0) ||
				(opcode === "thumb" && thumb.length === 0)
			)
				return "error";
			else return "success";
		} else return null;
	};

	render() {
		const { email, message, thumb } = this.state;

		// allow button to be clicked only when all fields are input
		const validity =
			!(
				this.getValidationState("message") || this.getValidationState("email")
			) ||
			(this.getValidationState("message") === "error" ||
				this.getValidationState("email") === "error") ||
			thumb.length === 0
				? true
				: false;

		return (
			<React.Fragment>
				<FormGroup validationState={this.getValidationState("thumb")}>
					<ControlLabel>Experience</ControlLabel>
					<ButtonToolbar>
						<ToggleButtonGroup
							onChange={this.handleChange("thumb")}
							type="radio"
							name="thumbs"
						>
							<ToggleButton value={"up"}>&#128077;</ToggleButton>
							<ToggleButton value={"down"}>&#128078;</ToggleButton>
						</ToggleButtonGroup>
					</ButtonToolbar>
				</FormGroup>

				<FormGroup validationState={this.getValidationState("message")}>
					<ControlLabel>Message</ControlLabel>
					<FormControl
						type="text"
						componentClass="textarea"
						value={message}
						onChange={this.handleChange("message")}
						placeholder="Add the story URL link if you need me to debug something!"
					/>
				</FormGroup>
				<FormGroup validationState={this.getValidationState("email")}>
					<ControlLabel>Email</ControlLabel>
					<FormControl
						type="email"
						value={email}
						placeholder="Check your email within a week for my reply!"
						onChange={this.handleChange("email")}
					/>
				</FormGroup>
				<Button
					onClick={
						this.handleClick // bsClass="grabwatt-button"
					}
					disabled={validity}
				>
					Go
				</Button>
			</React.Fragment>
		);
	}
}

export default FeedbackBody;
