import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import ReactGA from "react-ga";

import GAListener from "./GAListener";
import FormMain from "../components/FormMain";
import NotFound from "../components/NotFound";
import LoaderMain from "../components/LoaderMain";
import FeedbackMain from "../components/FeedbackMain";

const gaTracker =
	process.env.NODE_ENV === "development" ? "UA-123756712-3" : "UA-123756712-1";
ReactGA.initialize(gaTracker, { titleCase: false });

const Router = () => (
	<BrowserRouter>
		<GAListener>
			<Switch>
				<Route exact path="/" component={FormMain} />
				<Route path="/error" component={NotFound} />
				<Route exact path="/feedback" component={FeedbackMain} />
				<Route path="/:storyId" component={LoaderMain} />
			</Switch>
		</GAListener>
	</BrowserRouter>
);

export default Router;
