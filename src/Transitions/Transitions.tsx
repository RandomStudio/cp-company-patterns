import { useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
} from "react-router-dom";
import * as PIXI from "pixi.js";
import { Size } from "../App";
import Grid from "./Grid";
import Item from "./Item";

import "./Transitions.scss";

interface Props {
  canvasSize: Size;
}

export const Transitions = (props: Props) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    transparent: true,
  });

  const startTransition = (itemId?: number) => {
    console.log("starting transition to item", itemId);
  };

  app.start();

  const ref: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    if (ref.current) {
      console.log("append app view");
      ref.current.appendChild(app.view);
    }

    return () => {
      console.log("destroy PIXI app");
      app.destroy(true);
    };
  });

  let { path } = useRouteMatch();

  return (
    <div className="Transitions">
      <h1>Transitions Demo</h1>
      <Route exact path={path}>
        <Grid startTransitionFunction={startTransition} />
      </Route>
      <Route path={`${path}/:itemId`}>
        <Item />
      </Route>

      <div className="container" ref={ref} />
    </div>
  );
};

export default Transitions;
