import React from "react";
import { Button } from "react-bootstrap";

import { logToGA } from "../helpers";

class NotFound extends React.Component {
	handleHome = () => {
		logToGA("error", "redirection", "return-home");
		this.props.history.push("/");
	};

	render() {
		return (
			<div className="flex-fullview background">
				<h1 className="error-404">404</h1>
				<p>The story you are looking for has expired</p>
				<div>
					<Button bsStyle="warning" onClick={this.handleHome}>
						Return home
					</Button>
				</div>
			</div>
		);
	}
}

export default NotFound;
