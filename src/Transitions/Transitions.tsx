import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Size } from "../App";
import Item from "./Item";

import "./Transitions.scss";
import { PatternSettings } from "../SimpleTest/Pattern";

const items = [0, 1, 2, 5];
interface Props {
  canvasSize: Size;
  settings: PatternSettings;
}

const loadShaders = (props: Props) =>
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

export const Transitions = (props: Props) => {
  const app = new PIXI.Application({
    width: props.canvasSize.width,
    height: props.canvasSize.height,
    // transparent: true,
    backgroundColor: 0xff0000,
  });

  const startTransition = (itemId: number, onDone: () => void) => {
    console.log("starting transition to item", itemId);
    setTimeout(() => {
      onDone();
    }, 2000);
  };

  app.start();

  loadShaders(props).then((filters) => {
    console.log("loaded custom filters:", filters);
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
            <li
              key={`item-${i}`}
              onClick={() => {
                setActive(true);
                setItemId(i);
                startTransition(i, () => {
                  setActive(false);
                });
              }}
            >
              Item {i}
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
