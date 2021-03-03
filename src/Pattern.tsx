import React, { useRef, useEffect } from "react";
import * as PIXI from "pixi.js";

// @ts-ignore
import ColorThief from "colorthief";

import { fromRGB } from "hex-color-utils";

interface PatternProps {
  canvasSize: {
    width: number;
    height: number;
  };
  image: {
    src: string;
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

    initGraphics(app, props.image);

    return () => {
      app.destroy(true);
    };
  });

  return <div ref={ref}></div>;
};

export default Pattern;

const initGraphics = (app: PIXI.Application, img: PatternProps["image"]) => {
  const { width, height } = app.screen;

  const loader = new PIXI.Loader();

  loader.add("product", img.src);
  loader.add("grainShader", "/shaders/grain.frag");
  loader.add("thresholdShader", "/shaders/threshold.frag");

  // let tilingSprite: PIXI.TilingSprite;
  // let foregroundContainer: PIXI.Container;
  // let renderTexture: PIXI.RenderTexture;

  loader.load(async (loaders, resources) => {
    if (
      resources.product &&
      resources.product.texture &&
      resources.grainShader &&
      resources.grainShader.data &&
      resources.thresholdShader &&
      resources.thresholdShader
    ) {
      const productTexture = resources.product.texture;
      const x = productTexture.width * 0.4;
      const y = productTexture.height * 0.4;
      const w = productTexture.width * 0.25;
      const h = productTexture.height * 0.25;
      productTexture.frame = new PIXI.Rectangle(x, y, w, h);

      const colorThief = new ColorThief();
      try {
        const colours = await colorThief.getColor(resources.product.data);
        const [r, g, b] = colours.map((c: number) => c / 255.0);
        console.log("got colours:", { colours, r, g, b }, fromRGB(r, g, b));
        const graphics = new PIXI.Graphics();

        graphics.beginFill(fromRGB(r, g, b));
        graphics.drawRect(0, 0, width, height);
        graphics.endFill();

        app.stage.addChild(graphics);
      } catch (e) {
        console.error("colorThief error:", e);
      }

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
          strength: 16.0,
        }
      );

      const threshold = new PIXI.Filter(
        undefined,
        resources.thresholdShader.data,
        {
          cutoff: 0.5,
        }
      );

      colorMatrix.blackAndWhite(true);
      colorMatrix.contrast(0.2, true);
      // colorMatrix.brightness(0.2, true);
      // colorMatrix.kodachrome(true);

      tilingSprite.filters = [colorMatrix, grainEffect, threshold];
      // tilingSprite.scale.x = 2.0;
      // tilingSprite.scale.y = 2.0;

      foregroundContainer.addChild(tilingSprite);
      app.renderer.render(foregroundContainer, renderTexture, true);

      const foregroundSprite = new PIXI.Sprite(renderTexture);
      foregroundSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

      app.stage.addChild(foregroundSprite);

      app.ticker.add(() => {
        tilingSprite.tilePosition.x += 1;
        tilingSprite.tilePosition.y += 1;
        app.renderer.render(foregroundContainer, renderTexture, true);
      });
    } else {
      console.error("resource loading problem");
    }
  });

  // const productTexture = PIXI.Texture.from(;
};
