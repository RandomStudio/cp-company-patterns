import React, { useRef, useEffect } from "react";
import * as PIXI from "pixi.js";

interface PatternProps {
  canvasSize: {
    width: number;
    height: number;
  };
}

export const Pattern: React.FunctionComponent<PatternProps> = (
  props: PatternProps
) => {
  const ref: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  useEffect(() => {
    const app = new PIXI.Application({
      width: props.canvasSize.width,
      height: props.canvasSize.height,
      backgroundColor: 0x000055,
    });

    if (ref.current) {
      ref.current.appendChild(app.view);
    }
    app.start();

    initGraphics(app);

    return () => {
      app.destroy(true);
    };
  });

  return <div ref={ref}></div>;
};

export default Pattern;

const initGraphics = (app: PIXI.Application) => {
  const { width, height } = app.screen;

  const graphics = new PIXI.Graphics();

  graphics.beginFill(0x95300a);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();

  app.stage.addChild(graphics);

  const productTexture = PIXI.Texture.from("/products/ART45184Q59.JPG");

  const tilingSprite = new PIXI.TilingSprite(productTexture, width, height);

  let colorMatrix = new PIXI.filters.ColorMatrixFilter();

  const foregroundContainer = new PIXI.Container();
  const renderTexture = PIXI.RenderTexture.create({
    width,
    height,
  });

  // colorMatrix.blendMode = PIXI.BLEND_MODES.MULTIPLY;
  colorMatrix.blackAndWhite(true);
  colorMatrix.contrast(1.0, true);

  tilingSprite.filters = [colorMatrix];
  // foreground.alpha = 0.5;
  // colorMatrix.blackAndWhite(true);

  // tilingSprite.blendMode = PIXI.BKLEND_MODES.MULTIPLY;

  // foreground.filters = [noiseFilter];

  foregroundContainer.addChild(tilingSprite);
  app.renderer.render(foregroundContainer, renderTexture, true);

  const foregroundSprite = new PIXI.Sprite(renderTexture);
  foregroundSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  app.stage.addChild(foregroundSprite);

  app.ticker.add(() => {
    tilingSprite.tilePosition.x += 1;
    tilingSprite.tilePosition.y += 2;
    app.renderer.render(foregroundContainer, renderTexture, true);
  });
};
