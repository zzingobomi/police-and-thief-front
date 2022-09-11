import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { InGame } from "../pages/ingame/in-game";

export const LoggedInRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <InGame />
        </Route>
      </Switch>
    </Router>
  );
};
