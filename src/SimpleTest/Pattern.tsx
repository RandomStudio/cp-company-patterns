import React, { useRef, useEffect } from "react";
import * as PIXI from "pixi.js";

import { Size } from "../App";
import { initGraphics, loadResources } from "../PatternBuilderFunctions";

export interface PatternSettings {
  overlay: {
    alpha: number;
  };
  grain: {
    useRandom: boolean;
    magicNumber: number;
    strength: number;
  };
}

export interface PatternProps {
  canvasSize: Size;
  image: {
    src: string;
  };
  settings: PatternSettings;
}

export const Pattern: React.FunctionComponent<PatternProps> = (
  props: PatternProps
) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    backgroundColor: 0x000055,
  });

  app.start();

  loadResources(props.image).then((resources) => {
    initGraphics(app, resources, props);
  });

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

  return <div ref={ref}></div>;
};

export default Pattern;
