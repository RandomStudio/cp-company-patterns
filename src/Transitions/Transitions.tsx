import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Size } from "../App";
import Item from "./Item";

import "./Transitions.scss";
import {
  findCrop,
  getDominantColour,
  getThreshold,
  PatternSettings,
} from "../SimpleTest/Pattern";
import { toHSLArray } from "hex-color-utils";

import { remap } from "@anselan/maprange";

interface CustomFilters {
  grainEffect: PIXI.Filter;
  thresholdEffect: PIXI.Filter;
}

const items = [
  {
    id: 0,
    url: "/products/ARCH_.jpg",
  },
  {
    id: 1,
    url: "/products/NO-CODE.JPG",
  },
];
interface Props {
  canvasSize: Size;
  settings: PatternSettings;
}

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

const startTransitionEffect = async (
  app: PIXI.Application,
  controls: {
    thresholdEffect: PIXI.Filter;
    flatColourBackground: PIXI.Graphics;
    foregroundContainer: PIXI.Container;
    renderTexture: PIXI.RenderTexture;
  },
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

  const duration = 2000;
  const contentSwitchPoint = 0.5;
  let elapsed = 0;

  // In the animation timing below, position 1.0 is transition
  // complete, and content switch point is halfway into the
  // transition, i.e. 0.5

  let hasReachedContentSwitch = false;
  let hasReachedTransitionDone = false;

  app.ticker.add(() => {
    elapsed += app.ticker.deltaMS;
    const progress = remap(elapsed, [0, duration], [0, 1], true);

    if (progress < contentSwitchPoint) {
      // "fade in"
      const thresholdTiming = remap(progress, [0, 0.5], [0, 1], true);
      thresholdEffect.uniforms["cutoff"] = thresholdTiming;

      const flatColourTiming = remap(progress, [0.25, 0.5], [0, 1], true);
      flatColourBackground.alpha = flatColourTiming;
    } else {
      // "fade out"
      const allAlphaTiming = remap(progress, [0.5, 0.75], [0, 1], true);
      app.stage.alpha = 1 - allAlphaTiming; // inverse

      const thresholdTiming = remap(progress, [0.5, 0.6], [0, 1], true);
      thresholdEffect.uniforms["cutoff"] = 1 - thresholdTiming;
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

      const dominantColour = await getDominantColour(data);

      const flatColourBackground = new PIXI.Graphics();

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
        { ...callbacks }
      );
    }
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

  const [itemId, setItemId] = useState<null | number>(null);
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
      <h1>Transitions Demo</h1>
      {itemId === null && (
        <ul>
          {items.map((i) => (
            <li key={`item-${i.id}`}>
              <button
                onClick={() => {
                  setActive(true);

                  prepareTransition(i.id, customFilters, app, props, {
                    onContentShouldSwitch: () => {
                      setItemId(i.id);
                    },
                    onTransitionFinished: () => {
                      setActive(false);
                    },
                  });
                }}
              >
                Item {i.id}
              </button>
            </li>
          ))}
        </ul>
      )}
      {itemId !== null && <Item id={itemId} />}
      <div className={`container ${active ? "active" : ""}`} ref={ref} />
    </div>
  );
};

export default Transitions;
