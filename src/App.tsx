import "./App.scss";

import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import SimpleTest from "./SimpleTest/SimpleTest";
import Transitions from "./Transitions/Transitions";

export interface Size {
  width: number;
  height: number;
}

const App = () => {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/static">
            <SimpleTest />
          </Route>
          <Route path="/transition">
            <Transitions
              canvasSize={{
                width: window.innerWidth,
                height: window.innerHeight,
              }}
            />
          </Route>
          <Route path="/">
            <Home />
          </Route>
        </Switch>
      </div>
    </Router>
  );
};

const Home = () => (
  <div>
    <p>Click links to view prototypes.</p>

    <nav>
      <Link to="/static">Simple static test</Link>
      <Link to="/transition">Transition tests</Link>
    </nav>
  </div>
);

export default App;
