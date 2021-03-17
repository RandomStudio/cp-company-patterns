// @ts-ignore
import ColorThief from "colorthief";
import { fromRGB, toHSLArray } from "hex-color-utils";
import { StringDecoder } from "node:string_decoder";
import { useEffect, useState } from "react";
import { getBestColour } from "./Transitions";
interface Props {
  index: number;
  id: number;
  url: string;
  debug: boolean;
}

interface ColourData {
  dominantColour?: number;
  palette?: number[];
  bestColour?: number;
}

const rgbArrayToHexString = (rgb: number[]): number => {
  const [r, g, b] = rgb.map((c) => c / 255.0);
  return fromRGB(r, g, b);
};

const Item = (props: Props) => {
  const colorThief = new ColorThief();

  const [colourData, setColourData] = useState<ColourData>({});

  useEffect(() => {
    if (props.debug === true) {
      const img = new Image();
      img.src = props.url;
      img.onload = async () => {
        const dominantColour = rgbArrayToHexString(
          await colorThief.getColor(img, 4)
        );
        const palette = await colorThief
          .getPalette(img, 7, 4)
          .map((c: number[]) => rgbArrayToHexString(c));
        // console.log({ c });
        const bestColour = await getBestColour(img);
        console.log({ url: props.url, dominantColour, palette, bestColour });
        setColourData({ dominantColour, palette, bestColour });
      };
    }
  }, []);

  return (
    <div className="Item">
      <h2>
        [{props.index}]:#{props.id}
      </h2>
      <img src={props.url} alt="large"></img>
      {colourData &&
        colourData.dominantColour &&
        colourData.palette &&
        colourData.bestColour && (
          <div>
            <Swatch
              colour={colourData.dominantColour}
              addClass={
                colourData.dominantColour === colourData.bestColour
                  ? "dominant best"
                  : "dominant"
              }
            />
            {colourData.palette.map((c, i) => (
              <Swatch
                colour={c}
                addClass={
                  c === colourData.bestColour ? "palette best" : "palette"
                }
                key={`palette-swatch-${i}`}
              />
            ))}
          </div>
        )}
      <div>
        <a href="/transition">Back</a>
      </div>
    </div>
  );
};

const Swatch = (props: { colour: number; addClass: string }) => {
  const [h, s, l] = toHSLArray(props.colour);
  return (
    <div className="swatch-container">
      <div
        className={`swatch ${props.addClass}`}
        style={{
          backgroundColor: `#${props.colour.toString(16)}`,
        }}
      />
      <code>{JSON.stringify({ h, s, l }, null, 1)}</code>
    </div>
  );
};

export default Item;
