import React from "react";
import "./Spinner.css";

const Spinner: React.FC = () => (
  <div className="spinner-overlay">
    <div className="spinner" />
  </div>
);

export default Spinner;