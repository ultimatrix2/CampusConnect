import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";

// import { BrowserRouter as Router } from "react-router-dom";
import store from "./redux/store";
import "./index.css";

// Patch ResizeObserver to prevent "loop completed" errors
// This is a known benign error that occurs with resizable panels
const OriginalResizeObserver = window.ResizeObserver;
window.ResizeObserver = class ResizeObserver extends OriginalResizeObserver {
  constructor(callback) {
    super((entries, observer) => {
      // Use requestAnimationFrame to batch resize observations
      window.requestAnimationFrame(() => {
        callback(entries, observer);
      });
    });
  }
};

// Also suppress any remaining errors in console
const origError = console.error;
console.error = (...args) => {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('ResizeObserver')) {
    return;
  }
  origError.apply(console, args);
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <App />
      </GoogleOAuthProvider>
    </Provider>
  </React.StrictMode>
);
