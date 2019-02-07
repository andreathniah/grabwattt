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
import { logToGA } from "../helpers";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FeedbackBody extends React.Component {
	constructor(props) {
		super(props);
		this.state = { email: "", message: "", thumb: "", issue: "", status: true };
	}

	componentDidMount = () => {
		const alertMsg =
			"Returning feedback users are advised to check your email for relevant correspondence before logging a new support ticket.";
		toast(alertMsg, { autoClose: 8000 });
	};

	// disable submit button
	// redirect form data to google spreadsheet and email
	// log event to GA
	handleClick = () => {
		let { email, message, thumb } = this.state;
		this.setState({ status: false });

		const scriptURL = process.env.REACT_APP_SPREADSHEET_URL;
		const method = "POST";
		const body = new FormData(this.form);
		fetch(scriptURL, { method, body })
			.then(res => {
				logToGA("flag", "feedback", "feedback-spreadsheet");
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

	// update states upon changes to input form
	handleChange = opcode => event => {
		console.log(event);
		if (opcode !== "thumb" && opcode !== "issue")
			this.setState({ [opcode]: event.target.value });
		else this.setState({ [opcode]: event });
	};

	// return error when at least one field is empty
	// email bar must include @ to qualify
	getValidationState = opcode => {
		const { email, message, thumb, issue } = this.state;
		if (
			email.trim().length > 0 ||
			message.trim().length > 0 ||
			thumb.trim().length > 0 ||
			issue.trim().length > 0
		) {
			if (
				(opcode === "message" && message.length === 0) ||
				(opcode === "thumb" && thumb.length === 0) ||
				(opcode === "issue" && issue.length === 0) ||
				(opcode === "email" && (email.length === 0 || !email.includes("@")))
			)
				return "error";
			else return "success";
		} else return null;
	};

	render() {
		const { email, message, thumb, issue, status } = this.state;

		// allow button to be clicked only when all fields are input
		const validity =
			!(
				this.getValidationState("message") || this.getValidationState("email")
			) ||
			(this.getValidationState("message") === "error" ||
				this.getValidationState("email") === "error") ||
			thumb.length === 0 ||
			issue.length === 0 ||
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
							<ToggleButton value={"TRUE"}>
								<span role="img" aria-label="thumbs-up">
									&#128077;
								</span>
							</ToggleButton>
							<ToggleButton value={"FALSE"}>
								<span role="img" aria-label="thumbs-down">
									&#128078;
								</span>
							</ToggleButton>
						</ToggleButtonGroup>
					</ButtonToolbar>
				</FormGroup>

				<FormGroup validationState={this.getValidationState("issue")}>
					<ControlLabel>Facing issues with:</ControlLabel>
					<ButtonToolbar>
						<ToggleButtonGroup
							onChange={this.handleChange("issue")}
							type="radio"
							name="issue"
						>
							<ToggleButton value={"EXTRACT"}>Extraction</ToggleButton>
							<ToggleButton value={"PDF"}>PDF</ToggleButton>
							<ToggleButton value={"EPUB"}>EPUB</ToggleButton>
							<ToggleButton value={"OTHERS"}>Others</ToggleButton>
							<ToggleButton value={"BACKUP"}>
								Add me to the backup list!
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
						rows={5}
					/>
				</FormGroup>
				<FormGroup validationState={this.getValidationState("email")}>
					<ControlLabel>Email</ControlLabel>
					<FormControl
						type="email"
						name="email"
						value={email}
						onChange={this.handleChange("email")}
						placeholder="Make sure your email is correct!"
					/>
				</FormGroup>
				<Button
					bsStyle="primary"
					onClick={this.handleClick}
					disabled={validity}
				>
					Send
				</Button>
				<ToastContainer />
			</form>
		);
	}
}

export default FeedbackBody;
