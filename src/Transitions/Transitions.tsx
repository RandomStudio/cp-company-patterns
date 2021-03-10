import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Size } from "../App";
import Item from "./Item";

import "./Transitions.scss";
import { findCrop, PatternSettings } from "../SimpleTest/Pattern";

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

const loadShaders = (props: Props): Promise<{ [key: string]: PIXI.Filter }> =>
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
      }
    });
  });

const loadItemTexture = (
  url: string,
  app: PIXI.Application
): Promise<PIXI.Texture> =>
  new Promise((resolve, reject) => {
    const loader = new PIXI.Loader();
    const { width, height } = app.screen;

    loader.add("item", url);
    loader.load((loader, resources) => {
      if (resources.item) {
        const itemTexture = resources.item.texture;

        findCrop({ width, height }, itemTexture);

        resolve(itemTexture);
      } else {
        reject("resources.item failed to load");
      }
    });
  });

export const Transitions = (props: Props) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    transparent: true,
    // backgroundColor: 0xff0000,
  });

  const startTransition = (itemId: number, onDone: () => void) => {
    const item = items.find((i) => i.id === itemId);

    console.log("starting transition to item", item);
    if (filters !== null) {
      console.log("filters ready", filters);
      if (item) {
        console.log("loading item texture...");
        loadItemTexture(item.url, app).then((texture) => {
          const sprite = new PIXI.Sprite(texture);
          const { width, height } = app.screen;
          sprite.width = width;
          sprite.height = height;
          app.stage.addChild(sprite);
        });
      }
    }
    setTimeout(() => {
      onDone();
    }, 2000);
  };

  app.start();

  let filters: { [key: string]: PIXI.Filter } | null = null;

  loadShaders(props).then((res: { [key: string]: PIXI.Filter }) => {
    console.log("loaded custom filters:", res);
    filters = res;
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
  }, []);

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
