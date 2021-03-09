import { useEffect, useRef } from "react";
import * as PIXI from "pixi.js";
import { Size } from "../App";

import "./Transitions.scss";

interface Props {
  canvasSize: Size;
}

export const Transitions = (props: Props) => {
  useEffect(() => {});

  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    transparent: true,
  });

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
  return (
    <div className="Transitions">
      Content A
      <div className="container" ref={ref} />
    </div>
  );
};

export default Transitions;
