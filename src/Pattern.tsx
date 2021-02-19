import React, { useRef, useEffect } from "react";
import * as PIXI from 'pixi.js';

interface PatternProps {
  canvasSize: {
    width: number,
    height: number
  }
}

export const Pattern: React.FunctionComponent<PatternProps> = (props: PatternProps) => {

  const ref: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
        width: props.canvasSize.width,
        height: props.canvasSize.height,
        backgroundColor: 0x000055
    })

    if (ref.current) {
      ref.current.appendChild(app.view);
    }
    app.start();

    const graphics = new PIXI.Graphics();

    // Rectangle
    graphics.beginFill(0xDE3249);
    graphics.drawRect(50, 50, 100, 100);
    graphics.endFill();

    app.stage.addChild(graphics);

    return () => {
      app.destroy(true);
    }
  })
  

  return (
    <div ref={ref}></div>
  )

}

export default Pattern;