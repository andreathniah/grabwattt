import React from "react";
import FeedbackBody from "./FeedbackBody";

const FormGreeting = (
	<h1>
		<mark>feedback? i love it</mark>
	</h1>
);

const FormFeedback = (
	<a href="#" onClick={() => this.props.history.push("/feedback")}>
		<span>return home!</span>
	</a>
);

const FeedbackMain = () => {
	return (
		<div className="feedback-main grabwatt-background">
			<div>
				{FormGreeting}
				<FeedbackBody />
			</div>
			<div className="form-feedback">{FormFeedback}</div>
		</div>
	);
};

export default FeedbackMain;
