import React from "react";
import { useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "./apollo";
import { LoggedInRouter } from "./routers/logged-in-router";
import { LoggedOutRouter } from "./routers/logged-out-router";
import { World } from "./pages/world/world";

function App() {
  //const isLoggedIn = useReactiveVar(isLoggedInVar);
  //return isLoggedIn ? <LoggedInRouter /> : <LoggedOutRouter />;
  return <World />;
}

export default App;
