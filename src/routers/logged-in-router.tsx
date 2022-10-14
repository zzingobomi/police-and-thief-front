import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import { CreateRoom } from "../pages/create-room";
import { InGame } from "../pages/ingame/in-game";
import { Lobby } from "../pages/lobby";
import { Metaverse } from "../pages/metaverse/metaverse";
import { Result } from "../pages/result";
import { Room } from "../pages/room";
import { World } from "../pages/world/world";

export const LoggedInRouter = () => {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <Metaverse />
        </Route>
        {/* <Route path="/" exact>
          <World />
        </Route> */}

        {/* <Route path="/" exact>
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
        </Route> */}
      </Switch>
    </Router>
  );
};
