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
			<mark>want that wattpad fic?</mark>
		</h1>
		<div>
			enter any wattpad <span>chapter URL</span> to start! <br />
			data will be purged after <span>8 hours</span>
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
