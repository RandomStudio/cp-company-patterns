import React, { useRef, useEffect } from "react";
import * as PIXI from "pixi.js";

// @ts-ignore
import ColorThief from "colorthief";

import { fromRGB, toHSLArray } from "hex-color-utils";
import { Size } from "./App";

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

const findCrop = (
  canvasSize: { width: number; height: number },
  texture: PIXI.Texture
) => {
  const screenAspect = canvasSize.width / canvasSize.height;

  const w = texture.baseTexture.width * 0.5;
  const h = w / screenAspect;

  const x = texture.baseTexture.width * 0.5 - w / 2;
  const y = texture.baseTexture.height * 0.5 - h / 2;
  texture.frame = new PIXI.Rectangle(x, y, w, h);
};

const initGraphics = async (
  app: PIXI.Application,
  resources: Partial<Record<string, PIXI.LoaderResource>>,
  props: PatternProps
) => {
  const { width, height } = app.screen;

  if (resources.product && resources.grainShader && resources.thresholdShader) {
    // console.log("got resources", resources);
    const productTexture = resources.product.texture;
    console.log({ productTexture });
    findCrop({ width, height }, productTexture);

    let dominantColour = await getDominantColour(resources.product.data);

    const graphics = new PIXI.Graphics();

    graphics.beginFill(dominantColour);
    graphics.drawRect(0, 0, width, height);
    graphics.endFill();

    app.stage.addChild(graphics);

    const sprite = new PIXI.Sprite(productTexture);
    sprite.width = width;
    sprite.height = height;

    let colorMatrix = new PIXI.filters.ColorMatrixFilter();

    const foregroundContainer = new PIXI.Container();
    const renderTexture = PIXI.RenderTexture.create({
      width,
      height,
    });

    const grainEffect = new PIXI.Filter(undefined, resources.grainShader.data, {
      random: props.settings.grain.useRandom
        ? Math.random()
        : props.settings.grain.magicNumber,
      strength: props.settings.grain.strength,
    });

    const hsl = toHSLArray(dominantColour);
    console.log({ hsl });

    const thresholdValue = getThreshold(hsl);

    const threshold = new PIXI.Filter(
      undefined,
      resources.thresholdShader.data,
      {
        cutoff: thresholdValue,
      }
    );

    colorMatrix.blackAndWhite(true);
    colorMatrix.contrast(0.2, true);

    sprite.filters = [grainEffect, colorMatrix, threshold];

    foregroundContainer.addChild(sprite);
    app.renderer.render(foregroundContainer, renderTexture, true);

    const foregroundSprite = new PIXI.Sprite(renderTexture);
    foregroundSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

    foregroundSprite.alpha = props.settings.overlay.alpha;

    app.stage.addChild(foregroundSprite);

    addDebugInfo(app, dominantColour, thresholdValue, {
      width: productTexture.baseTexture.width,
      height: productTexture.baseTexture.height,
    });

    // app.ticker.add(() => {
    //   sprite.scale.x += sprite.scale.x * 0.001;
    //   //   tilingSprite.tilePosition.x += 1;
    //   //   tilingSprite.tilePosition.y += 1;
    //   app.renderer.render(foregroundContainer, renderTexture, true);
    // });
  }

  // const productTexture = PIXI.Texture.from(;
};

const addDebugInfo = (
  app: PIXI.Application,
  dominantColour: number,
  thresholdValue: number,
  textureSize: { width: number; height: number }
) => {
  const { width, height } = app.screen;
  const left = width * 0.75;
  const top = height * 0.05;

  const radius = 16;

  const graphics = new PIXI.Graphics();
  graphics.beginFill(dominantColour);
  graphics.lineStyle(8, 0xffffff, 1);
  graphics.drawCircle(left, top, 16);
  graphics.endFill();
  app.stage.addChild(graphics);

  const colourLabel = new PIXI.Text(`#${dominantColour.toString(16)}`);
  colourLabel.style.fill = 0xffffff;
  colourLabel.x = left + radius * 1.5;
  colourLabel.y = top - radius / 2;
  app.stage.addChild(colourLabel);

  const s = `
  Threshold value: ${thresholdValue.toFixed(2)}
  Original texture size: ${textureSize.width} x ${textureSize.height}
`;

  const text = new PIXI.Text(s);
  text.x = left;
  text.y = top * 1.5;
  text.scale = new PIXI.Point(0.5, 0.5);
  text.style.fill = 0xffffff;
  text.style.dropShadow = true;
  app.stage.addChild(text);
};

const getThreshold = (hsl: number[]) => {
  return hsl[2];
};
