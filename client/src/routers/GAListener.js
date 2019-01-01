import React from "react";
import PropTypes from "prop-types";
import ReactGA from "react-ga";

// Listener layer to play nice with React Router
class GAListener extends React.Component {
	static contextTypes = {
		router: PropTypes.object
	};

	componentDidMount() {
		this.sendPageView(this.context.router.history.location);
		this.context.router.history.listen(this.sendPageView);
	}

	sendPageView(location) {
		ReactGA.set({ page: location.pathname });
		ReactGA.pageview(location.pathname);
	}

	render() {
		return <div>{this.props.children}</div>;
	}
}

export default GAListener;
