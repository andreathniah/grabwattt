import React from "react";
import ReactGA from "react-ga";

class NotFound extends React.Component {
	handleHome = () => {
		ReactGA.event({
			category: "error",
			action: "redirection",
			label: "return-home"
		});
		this.props.history.push("/");
	};

	render() {
		return (
			<div className="flex-fullview background">
				<h1 className="error-404">404</h1>
				<p>The story you are looking for has expired</p>
				<div>
					<button type="button" className="button" onClick={this.handleHome}>
						Return home
					</button>
				</div>
			</div>
		);
	}
}

export default NotFound;
