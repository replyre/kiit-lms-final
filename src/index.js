import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // This import is crucial
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
