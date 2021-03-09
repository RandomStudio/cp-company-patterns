import { useEffect, useRef, useState } from "react";
import * as PIXI from "pixi.js";
import { Size } from "../App";
import Item from "./Item";

import "./Transitions.scss";

const items = [0, 1, 2, 5];
interface Props {
  canvasSize: Size;
}

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
