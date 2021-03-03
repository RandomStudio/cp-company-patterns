import React, { useRef, useEffect, useState } from "react";
import * as PIXI from "pixi.js";

// @ts-ignore
import ColorThief from "colorthief";

import { fromRGB, toHSLArray } from "hex-color-utils";

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
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    backgroundColor: 0x000055,
  });

  app.start();

  loadResources(props.image).then((resources) => {
    initGraphics(app, resources);
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

const loadResources = (
  img: PatternProps["image"]
): Promise<Partial<Record<string, PIXI.LoaderResource>>> =>
  new Promise((resolve, reject) => {
    console.log("new promise");
    const loader = new PIXI.Loader();
    // const loader = PIXI.Loader.shared;

    loader
      .add("product", img.src)
      .add("grainShader", "/shaders/grain.frag")
      .add("thresholdShader", "/shaders/threshold.frag");

    loader.load((loaders, resources) => {
      resolve(resources);
    });

    // loader.load();
    loader.onComplete.add(() => {
      console.log("done!");
    });
  });

const getDominantColour = async (imgData: any) => {
  const colorThief = new ColorThief();
  const colours = await colorThief.getColor(imgData);
  const [r, g, b] = colours.map((c: number) => c / 255.0);
  return fromRGB(r, g, b);
};

const initGraphics = async (
  app: PIXI.Application,
  resources: Partial<Record<string, PIXI.LoaderResource>>
) => {
  const { width, height } = app.screen;

  if (resources.product && resources.grainShader && resources.thresholdShader) {
    const productTexture = resources.product.texture;
    const x = productTexture.width * 0.4;
    const y = productTexture.height * 0.4;
    const w = productTexture.width * 0.25;
    const h = productTexture.height * 0.25;
    productTexture.frame = new PIXI.Rectangle(x, y, w, h);

    let dominantColour = await getDominantColour(resources.product.data);

    const graphics = new PIXI.Graphics();

    graphics.beginFill(dominantColour);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    app.stage.addChild(graphics);

    const tilingSprite = new PIXI.TilingSprite(productTexture, width, height);

    let colorMatrix = new PIXI.filters.ColorMatrixFilter();

    const foregroundContainer = new PIXI.Container();
    const renderTexture = PIXI.RenderTexture.create({
      width,
      height,
    });

    const grainEffect = new PIXI.Filter(undefined, resources.grainShader.data, {
      random: 0.2567,
      strength: 16.0,
    });

    const hsl = toHSLArray(dominantColour);
    console.log({ hsl });

    const threshold = new PIXI.Filter(
      undefined,
      resources.thresholdShader.data,
      {
        cutoff: hsl[2] * 1.1,
      }
    );

    colorMatrix.blackAndWhite(true);
    colorMatrix.contrast(0.2, true);
    // colorMatrix.brightness(0.2, true);
    // colorMatrix.kodachrome(true);

    tilingSprite.filters = [grainEffect, colorMatrix, threshold];
    // tilingSprite.scale.x = 2.0;
    // tilingSprite.scale.y = 2.0;

    foregroundContainer.addChild(tilingSprite);
    app.renderer.render(foregroundContainer, renderTexture, true);

    const foregroundSprite = new PIXI.Sprite(renderTexture);
    foregroundSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    app.stage.addChild(foregroundSprite);

    // app.ticker.add(() => {
    //   tilingSprite.tilePosition.x += 1;
    //   tilingSprite.tilePosition.y += 1;
    //   app.renderer.render(foregroundContainer, renderTexture, true);
    // });
  }

  // const productTexture = PIXI.Texture.from(;
};
