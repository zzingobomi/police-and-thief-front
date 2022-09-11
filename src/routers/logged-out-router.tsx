import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { NotFound } from "../pages/404";

export const LoggedOutRouter = () => {
  return (
    <Router>
      <Switch>
        <Route>
          <NotFound />
        </Route>
      </Switch>
    </Router>
  );
};
