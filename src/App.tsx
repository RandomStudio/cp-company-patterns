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
          <Route path="/transition/:designed">
            <Transitions
              settings={{
                overlay: {
                  alpha: 1.0,
                },
                grain: {
                  useRandom: false,
                  magicNumber: 0.456,
                  strength: 16.0,
                },
              }}
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
      <Link to="/transition/multi">Transition tests</Link>
      <Link to="/transition/single">Design Mockup Transition test</Link>
    </nav>
  </div>
);

export default App;
