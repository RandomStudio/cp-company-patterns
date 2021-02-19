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

    initGraphics(app);

    return () => {
      app.destroy(true);
    }
  })
  

  return (
    <div ref={ref}></div>
  )

}

export default Pattern;

const initGraphics = (app: PIXI.Application) => {
  const container = new PIXI.Container();

  const texture = PIXI.Texture.from("/products/ART45184Q59.JPG");

  const tilingSprite = new PIXI.TilingSprite(
    texture,
    app.screen.width,
    app.screen.height,
  );

  let colorMatrix = new PIXI.filters.ColorMatrixFilter();
  container.filters = [colorMatrix];
  colorMatrix.blackAndWhite(true);

  container.addChild(tilingSprite);

  app.stage.addChild(container);

  app.ticker.add(() => {
    tilingSprite.tilePosition.x +=1;
    tilingSprite.tilePosition.y +=2;
  })
}
