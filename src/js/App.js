import React, { Component } from "react";
import logo from "./logo.svg";
import "./App.css";

import UnsplashPage from "./pages/UnsplashPage";
import TFQuickDrawPage from "./pages/TFQuickdrawPage";
import Demo from "./pages/SampleCanvas";

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
        </header> */}
        {/* <UnsplashPage data={"test"} /> */}
        <TFQuickDrawPage />
        {/* <Demo /> */}
      </div>
    );
  }
}

export default App;
