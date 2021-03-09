import React from "react";
import "./App.scss";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SimpleTest from "./SimpleTest";

const App: React.FunctionComponent<{}> = () => {
  return (
    <div className="App">
      <SimpleTest />
    </div>
  );
};

export default App;
