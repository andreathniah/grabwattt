import React from "react";
import FeedbackBody from "./FeedbackBody";

const FormGreeting = (
	<h1>
		<mark>feedback? i love it</mark>
	</h1>
);

const FormFeedback = props => (
	<div className="form-feedback">
		<a href="#" onClick={() => props.history.push("/")}>
			<span>return home!</span>
		</a>
	</div>
);

const FeedbackMain = props => {
	return (
		<div className="feedback-main grabwatt-background">
			<div>
				{FormGreeting}
				<FeedbackBody {...props} />
			</div>
			{FormFeedback(props)}
		</div>
	);
};

export default FeedbackMain;
