import React from "react";
import "./LoadingPage.css";

export default function LoadingPage() {
  return (
    <div className="loading-container">
      <div className="loader">
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
        <span className="dot"></span>
      </div>
      <p>Loading your profile...</p>
    </div>
  );
}
