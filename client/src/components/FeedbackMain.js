import React from "react";
import FeedbackForm from "./FeedbackForm";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

class FeedbackMain extends React.Component {
	componentDidMount() {
		const alertMsg =
			"Returning feedback users are advised to check your email for relevant correspondence before logging a new support ticket.";
		toast(alertMsg, { autoClose: 8000 });
	}

	handleHome = () => {
		this.props.history.push("/");
	};

	render() {
		return (
			<div className="background">
				<div className="flex-fullview">
					<div className="container header">
						<h1>
							<mark>feedback? i love it!</mark>
						</h1>
					</div>
					<br />
					<FeedbackForm history={this.props.history} />
				</div>
				<ToastContainer />
				<div className="container flex-footer box">
					<a href="#" onClick={this.handleHome}>
						<span>return home!</span>
					</a>
				</div>
			</div>
		);
	}
}

export default FeedbackMain;
