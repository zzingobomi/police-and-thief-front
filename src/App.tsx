import React from "react";
import { useReactiveVar } from "@apollo/client";
import { isLoggedInVar } from "./apollo";
import { LoggedInRouter } from "./routers/logged-in-router";
import { LoggedOutRouter } from "./routers/logged-out-router";
import { World } from "./pages/world/world";

function App() {
  //const isLoggedIn = useReactiveVar(isLoggedInVar);
  const isLoggedIn = true;
  return isLoggedIn ? <LoggedInRouter /> : <LoggedOutRouter />;
}

export default App;
