import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import NotFound from "./NotFound";
import FormMain from "./FormMain";
import Loader from "./Loader";

import GAListener from "./GAListener";
import ReactGA from "react-ga";

// ReactGA.initialize("UA-123756712-1");
ReactGA.initialize("UA-123756712-3", { titleCase: false });

const Router = () => (
	<BrowserRouter>
		<GAListener>
			<Switch>
				<Route exact path="/" component={FormMain} />
				<Route exact path="/error404" component={NotFound} />
				<Route path="/:storyId" component={Loader} />
			</Switch>
		</GAListener>
	</BrowserRouter>
);

export default Router;
