import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CreateRoom } from "../pages/create-room";
import { InGame } from "../pages/ingame/in-game";
import { Lobby } from "../pages/lobby";
import { Result } from "../pages/result";
import { Room } from "../pages/room";

export const LoggedInRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Lobby />
        </Route>
        <Route path="/create-room" exact>
          <CreateRoom />
        </Route>
        <Route path="/room" exact>
          <Room />
        </Route>
        <Route path="/game" exact>
          <InGame />
        </Route>
        <Route path="/result" exact>
          <Result />
        </Route>
      </Switch>
    </Router>
  );
};
