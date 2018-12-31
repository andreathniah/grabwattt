import React from "react";
import ReactGA from "react-ga";

class FormGithub extends React.Component {
	handleGithub = event => {
		console.log("clicked");
		ReactGA.event({
			category: "flag",
			action: "redirection",
			label: "go-kofi"
		});
	};
	render() {
		return (
			<div className="box">
				<a
					href="https://ko-fi.com/grabwatt"
					target="_blank"
					onClick={this.handleGithub}
					rel="noopener noreferrer"
				>
					<span>help out with the server cost!</span>
				</a>
			</div>
		);
	}
}

export default FormGithub;
