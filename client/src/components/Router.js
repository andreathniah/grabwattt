import React from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";

import NotFound from "./NotFound";
import FormMain from "./FormMain";
import FicMain from "./FicMain";

const Router = () => (
	<BrowserRouter>
		<Switch>
			<Route exact path="/" component={FormMain} />
			<Route path="/:storyId" component={FicMain} />
			<Route component={NotFound} />
		</Switch>
	</BrowserRouter>
);

export default Router;
