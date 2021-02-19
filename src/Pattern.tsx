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

  const loader = new PIXI.Loader();

  loader.add("product", "/products/ART45184Q59.JPG");
  loader.add("grainShader", "/shaders/grain.frag");

  // let tilingSprite: PIXI.TilingSprite;
  // let foregroundContainer: PIXI.Container;
  // let renderTexture: PIXI.RenderTexture;

  loader.load((loaders, resources) => {
    if (
      resources.product &&
      resources.product.texture &&
      resources.grainShader &&
      resources.grainShader.data
    ) {
      const productTexture = resources.product.texture;
      const x = productTexture.width * 0.4;
      const y = productTexture.height * 0.4;
      const w = productTexture.width * 0.25;
      const h = productTexture.height * 0.25;
      productTexture.frame = new PIXI.Rectangle(x, y, w, h);

      const tilingSprite = new PIXI.TilingSprite(productTexture, width, height);

      let colorMatrix = new PIXI.filters.ColorMatrixFilter();

      const foregroundContainer = new PIXI.Container();
      const renderTexture = PIXI.RenderTexture.create({
        width,
        height,
      });

      const grainEffect = new PIXI.Filter(
        undefined,
        resources.grainShader.data,
        {
          random: 0.2567,
          strength: 64.0,
        }
      );

      colorMatrix.blackAndWhite(true);
      colorMatrix.contrast(0.2, true);
      // colorMatrix.brightness(0.2, true);
      // colorMatrix.kodachrome(true);

      tilingSprite.filters = [colorMatrix, grainEffect];
      // tilingSprite.scale.x = 2.0;
      // tilingSprite.scale.y = 2.0;

      foregroundContainer.addChild(tilingSprite);
      app.renderer.render(foregroundContainer, renderTexture, true);

      const foregroundSprite = new PIXI.Sprite(renderTexture);
      foregroundSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

      app.stage.addChild(foregroundSprite);

      app.ticker.add(() => {
        // tilingSprite.tilePosition.x += 1;
        // tilingSprite.tilePosition.y += 1;
        app.renderer.render(foregroundContainer, renderTexture, true);
      });
    } else {
      console.error("resource loading problem");
    }
  });

  // const productTexture = PIXI.Texture.from(;
};
