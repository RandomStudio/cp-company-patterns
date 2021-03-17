import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { remap } from "@anselan/maprange";
import { fromHSL, fromRGB, toHSLArray } from "hex-color-utils";

// @ts-ignore
import ColorThief from "colorthief";

import { Size } from "../App";
import Item from "./Item";

import "./Transitions.scss";
import {
  findCrop,
  getDominantColour,
  getThreshold,
  PatternSettings,
} from "../SimpleTest/Pattern";

import { items } from "./data";

interface CustomFilters {
  grainEffect: PIXI.Filter;
  thresholdEffect: PIXI.Filter;
}

interface Props {
  canvasSize: Size;
  settings: PatternSettings;
}

const weightedSaturation = (hsl: number[]) => {
  const [h, s, l] = hsl;
  return s / l;
};

// Quality = 4 is higher than default (10)
export const getBestColour = async (imgData: any, count = 7, quality = 4) => {
  const colorThief = new ColorThief();
  const dominantColour = await colorThief.getColor(imgData, quality);
  const paletteColours = await colorThief.getPalette(imgData, count, quality);

  const allColours = [dominantColour, ...paletteColours] // concatenate
    .map((c: number[]) => {
      const [r, g, b] = c.map((value) => value / 255);
      return {
        rgb: [r, g, b],
        hex: fromRGB(r, g, b),
      };
    })
    .map((c) => ({
      ...c,
      hsl: toHSLArray(c.hex),
    }));

  const findBest = [...allColours].sort((a, b) => {
    // const [h,s,l] = [0,1,2];
    return b.hsl[1] - a.hsl[1];
    // return weightedSaturation(b.hsl) - weightedSaturation(a.hsl);
  });

  console.log({
    dominantColour,
    paletteColours,
    allColours,
    findBest,
  });

  const best = findBest[0];

  if (best.hsl[2] < 0.25 || best.hsl[2] > 0.6) {
    // If Lightness value is too low or too high...
    return allColours[0].hex; // ...rather use dominant colour
  } else {
    return best.hex; // ...otherwise return the best match
  }
};

const loadCustomFilters = (props: Props): Promise<CustomFilters> =>
  new Promise((resolve, reject) => {
    const loader = new PIXI.Loader();

    loader
      .add("grainShader", "/shaders/grain.frag")
      .add("thresholdShader", "/shaders/threshold.frag");

    loader.load((loaders, resources) => {
      if (resources && resources.grainShader && resources.thresholdShader) {
        resolve({
          grainEffect: new PIXI.Filter(undefined, resources.grainShader.data, {
            random: props.settings.grain.useRandom
              ? Math.random()
              : props.settings.grain.magicNumber,
            strength: props.settings.grain.strength,
          }),
          thresholdEffect: new PIXI.Filter(
            undefined,
            resources.thresholdShader.data,
            {
              cutoff: 0,
              useAlpha: true,
            }
          ),
        });
      } else {
        reject("Shader resources did not load");
      }
    });
  });

const loadItemResource = (url: string): Promise<PIXI.LoaderResource> =>
  new Promise((resolve, reject) => {
    const loader = new PIXI.Loader();

    loader.add("item", url);
    loader.load((loader, resources) => {
      if (resources.item) {
        resolve(resources.item);
      } else {
        reject("resources.item failed to load");
      }
    });
  });

// const randomOffset = () =>

const makeSteppy = (value: number, resolution: number) =>
  Math.round(value * resolution) / resolution;

const startTransitionEffect = async (
  app: PIXI.Application,
  controls: {
    thresholdEffect: PIXI.Filter;
    flatColourBackground: PIXI.Graphics;
    foregroundContainer: PIXI.Container;
    renderTexture: PIXI.RenderTexture;
  },
  dominantColour: number,
  callbacks: {
    onContentShouldSwitch: () => void;
    onTransitionFinished: () => void;
  }
) => {
  const {
    thresholdEffect,
    flatColourBackground,
    foregroundContainer,
    renderTexture,
  } = controls;

  const duration = 1500;
  const contentSwitchPoint = 0.5;
  let elapsed = 0;

  // In the animation timing below, position 1.0 is transition
  // complete, and content switch point is halfway into the
  // transition, i.e. 0.5

  let hasReachedContentSwitch = false;
  let hasReachedTransitionDone = false;

  const hsl = toHSLArray(dominantColour);
  const targetThresholdValue = getThreshold(hsl);

  // console.log({
  //   hsl,
  //   dominantColour: dominantColour.toString(16),
  //   targetThresholdValue,
  // });

  // TODO: some (all?) of these values should be configurable not hard-coded
  const steppiness = 20;
  const jumpAroundEvery = 80; // how many ms between offset changes on fade out
  let jumpAroundElapsed = 0;
  const jumpRange = app.screen.width * 0.01;

  app.ticker.add(() => {
    elapsed += app.ticker.deltaMS;
    const progress = makeSteppy(
      remap(elapsed, [0, duration], [0, 1], true),
      steppiness
    );
    // const progress = remap(elapsed, [0, duration], [0, 1], true);

    if (progress < contentSwitchPoint) {
      // "fade in"

      foregroundContainer.scale = new PIXI.Point(1, 1);

      const thresholdTiming = remap(
        progress,
        [0, 0.5],
        [0, targetThresholdValue],
        true
      );
      thresholdEffect.uniforms["cutoff"] = thresholdTiming;

      const flatColourTiming = remap(progress, [0.15, 0.3], [0, 1], true);
      flatColourBackground.alpha = flatColourTiming;
    } else {
      // "fade out"
      foregroundContainer.scale = new PIXI.Point(2, 2);

      jumpAroundElapsed += app.ticker.deltaMS;

      if (jumpAroundElapsed >= jumpAroundEvery) {
        const [offsetX, offsetY] = [
          remap(Math.random(), [0, 1], [-jumpRange, jumpRange]),
          remap(Math.random(), [0, 1], [-jumpRange, jumpRange]),
        ];
        const [halfwayX, halfwayY] = [
          0.5 * app.screen.width,
          0.5 * app.screen.height,
        ];
        foregroundContainer.position = new PIXI.Point(
          offsetX - halfwayX,
          offsetY - halfwayY
        );
        jumpAroundElapsed = 0;
      }

      const allAlphaTiming = remap(progress, [0.5, 0.7], [1, 0], true);
      // console.log({ progress, allAlphaTiming });
      app.stage.alpha = allAlphaTiming; // inverse

      // const thresholdTiming = remap(progress, [0.5, 0.55], [0, 1], true);
      // thresholdEffect.uniforms["cutoff"] = thresholdTiming;
    }

    app.renderer.render(foregroundContainer, renderTexture, true);

    if (progress >= 0.5 && hasReachedContentSwitch === false) {
      hasReachedContentSwitch = true;
      // Once animation progress is at 0.5, trigger content to switch behind
      console.log("switch content now!");
      callbacks.onContentShouldSwitch();
    }
    if (progress >= 1.0 && hasReachedTransitionDone === false) {
      hasReachedTransitionDone = true;
      console.log("transition done!");
      callbacks.onTransitionFinished();
    }
  });
};

const prepareTransition = async (
  itemId: number,
  customFilters: CustomFilters | null = null,
  app: PIXI.Application,
  props: Props,
  callbacks: {
    onContentShouldSwitch: () => void;
    onTransitionFinished: () => void;
  }
) => {
  const item = items.find((i) => i.id === itemId);

  if (customFilters !== null) {
    if (item) {
      const itemResource = await loadItemResource(item.url);

      console.log("loaded resource", { itemResource });

      const { width, height } = app.screen;

      const { data, texture } = itemResource;

      findCrop({ width, height }, texture);

      const dominantColour = await getBestColour(data);

      const flatColourBackground = new PIXI.Graphics();

      // let [h, s, l] = toHSLArray(dominantColour);
      // s = remap(s, [0, 1], [0.5, 1], true);
      // const overlayColour = fromHSL(h, s, l);

      flatColourBackground.beginFill(dominantColour);
      flatColourBackground.drawRect(0, 0, width, height);
      flatColourBackground.endFill();

      flatColourBackground.alpha = 0; // initial value

      app.stage.addChild(flatColourBackground);

      const sprite = new PIXI.Sprite(texture);
      sprite.width = width;
      sprite.height = height;

      let colorMatrix = new PIXI.filters.ColorMatrixFilter();

      const foregroundContainer = new PIXI.Container();
      const renderTexture = PIXI.RenderTexture.create({
        width,
        height,
      });

      const { grainEffect, thresholdEffect } = customFilters;

      thresholdEffect.uniforms["cutoff"] = 0; // initial value

      colorMatrix.blackAndWhite(true);
      colorMatrix.contrast(0.2, true);

      sprite.filters = [grainEffect, colorMatrix, thresholdEffect];

      foregroundContainer.addChild(sprite);
      app.renderer.render(foregroundContainer, renderTexture, true);

      const foregroundLayerSprite = new PIXI.Sprite(renderTexture);
      foregroundLayerSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;
      // foregroundLayerSprite.blendMode = PIXI.BLEND_MODES.DARKEN;

      foregroundLayerSprite.alpha = props.settings.overlay.alpha;

      app.stage.addChild(foregroundLayerSprite);

      startTransitionEffect(
        app,
        {
          thresholdEffect,
          flatColourBackground,
          foregroundContainer,
          renderTexture,
        },
        dominantColour,
        { ...callbacks }
      );
    }
  } else {
    throw Error("custom filters not ready for transition");
  }
};

export const Transitions = (props: Props) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    transparent: true,
    // backgroundColor: 0xff0000,
  });

  let customFilters: CustomFilters | null = null;

  app.start();

  loadCustomFilters(props).then((res: CustomFilters) => {
    console.log("loaded custom filters:", res);
    customFilters = res;
  });

  const ref: React.MutableRefObject<HTMLDivElement | null> = useRef(null);

  const [itemIndex, setItemIndex] = useState<null | number>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (ref.current) {
      console.log("append app view");
      ref.current.appendChild(app.view);
    }

    return () => {
      console.log("destroy PIXI app");
      app.destroy(true);
    };
  }, []); // no deps, i.e. do not re-render unnecessarily

  return (
    <div className="Transitions">
      {itemIndex === null && (
        <div>
          {items.map((i, index) => (
            <div
              key={`item-${i.id}`}
              className="item-box"
              onClick={() => {
                setActive(true);

                prepareTransition(i.id, customFilters, app, props, {
                  onContentShouldSwitch: () => {
                    setItemIndex(index);
                  },
                  onTransitionFinished: () => {
                    setActive(false);
                  },
                });
              }}
            >
              <img src={i.url} className="grid-image"></img>
            </div>
          ))}
        </div>
      )}
      {itemIndex !== null && (
        <Item
          id={items[itemIndex].id}
          index={itemIndex}
          url={items[itemIndex].url}
          debug={false}
        />
      )}
      <div className={`container ${active ? "active" : ""}`} ref={ref} />
    </div>
  );
};

export default Transitions;
