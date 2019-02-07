import React from "react";
import InfoInstructions from "./InfoInstructions";
import { logToGA } from "../helpers";

const handleLogging = () => {
	logToGA("flag", "redirection", "go-kofi");
};

const FormKoFi = (
	<a
		href="https://ko-fi.com/grabwatt"
		target="_blank"
		onClick={handleLogging}
		rel="noopener noreferrer"
	>
		<span>help out with the server cost!</span>
	</a>
);

const FormGreeting = (
	<React.Fragment>
		<h1>
			<mark>grabwatt in different language?</mark>
		</h1>
		<div>
			this a <span>temporary</span> site to accomodate to stories with unique
			characters.
			<br />
			<span>
				<strong>DO NOT SHARE THIS LINK.</strong>
			</span>
			<br />
			<br />
		</div>
	</React.Fragment>
);

const FormHeader = () => {
	return (
		<div className="form-header">
			{FormGreeting}
			<InfoInstructions />
			{FormKoFi}
		</div>
	);
};

export default FormHeader;
