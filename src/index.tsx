import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { HelmetProvider } from "react-helmet-async";
import "./styles/styles.css";
import * as Colyseus from "colyseus.js";
import { colyseusContext } from "./context";

const client = new Colyseus.Client("ws://localhost:7200");

ReactDOM.render(
  <React.StrictMode>
    <colyseusContext.Provider value={{ client }}>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </colyseusContext.Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
