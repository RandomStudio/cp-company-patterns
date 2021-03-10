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
    url: "/products/NO-CODE.jpg",
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

const prepareLayers = async (
  app: PIXI.Application,
  itemResource: PIXI.LoaderResource,
  customFilters: CustomFilters,
  props: Props
) => {
  const { width, height } = app.screen;

  const { data, texture } = itemResource;

  findCrop({ width, height }, texture);

  const dominantColour = await getDominantColour(data);

  const graphics = new PIXI.Graphics();

  graphics.beginFill(dominantColour);
  graphics.drawRect(0, 0, width, height);
  graphics.endFill();

  app.stage.addChild(graphics);

  const sprite = new PIXI.Sprite(texture);
  sprite.width = width;
  sprite.height = height;

  let colorMatrix = new PIXI.filters.ColorMatrixFilter();

  const foregroundContainer = new PIXI.Container();
  const renderTexture = PIXI.RenderTexture.create({
    width,
    height,
  });

  const hsl = toHSLArray(dominantColour);
  const targetThresholdValue = getThreshold(hsl);

  const { grainEffect, thresholdEffect } = customFilters;

  // TODO: animate this
  thresholdEffect.uniforms["cutoff"] = targetThresholdValue;

  colorMatrix.blackAndWhite(true);
  colorMatrix.contrast(0.2, true);

  sprite.filters = [grainEffect, colorMatrix, thresholdEffect];

  foregroundContainer.addChild(sprite);
  app.renderer.render(foregroundContainer, renderTexture, true);

  const foregroundLayerSprite = new PIXI.Sprite(renderTexture);
  foregroundLayerSprite.blendMode = PIXI.BLEND_MODES.MULTIPLY;

  foregroundLayerSprite.alpha = props.settings.overlay.alpha;

  app.stage.addChild(foregroundLayerSprite);
};

export const Transitions = (props: Props) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    transparent: true,
    // backgroundColor: 0xff0000,
  });

  let customFilters: CustomFilters | null = null;

  const startTransition = async (itemId: number, onDone: () => void) => {
    const item = items.find((i) => i.id === itemId);

    console.log("starting transition to item", item);
    if (customFilters !== null) {
      console.log("filters ready", customFilters);
      if (item) {
        console.log("loading item texture...");
        const itemResource = await loadItemResource(item.url);
        await prepareLayers(app, itemResource, customFilters, props);
      }
    }
    setTimeout(() => {
      onDone();
    }, 2000);
  };

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
                  startTransition(i.id, () => {
                    setItemId(i.id);
                    setActive(false);
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
