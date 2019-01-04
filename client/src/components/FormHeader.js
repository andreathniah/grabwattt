import React from "react";

const FormKoFi = (
	<a
		href="https://ko-fi.com/grabwatt"
		target="_blank"
		onClick={this.handleGithub}
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
			{FormKoFi}
		</div>
	);
};

export default FormHeader;
