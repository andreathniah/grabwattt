import React from "react";
import { Button } from "react-bootstrap";
import { logToGA, getHelmet } from "../helpers";

class NotFound extends React.Component {
	handleHome = () => {
		logToGA("error", "redirection", "return-home");
		this.props.history.push("/");
	};

	render() {
		return (
			<div className="error-main grabwatt-background">
				{getHelmet("Not Found")}
				<div>
					<h1 className="error-404">404</h1>
					<p>The story you are looking for has expired</p>
					<Button bsStyle="warning" onClick={this.handleHome}>
						Return home
					</Button>
				</div>
			</div>
		);
	}
}

export default NotFound;
