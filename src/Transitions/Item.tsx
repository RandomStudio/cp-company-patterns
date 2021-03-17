// @ts-ignore
import ColorThief from "colorthief";
import { fromRGB } from "hex-color-utils";
import { StringDecoder } from "node:string_decoder";
import { useEffect, useState } from "react";
interface Props {
  index: number;
  id: number;
  url: string;
}

interface ColourData {
  dominantColour?: number;
  palette?: number[];
}

const rgbArrayToHexString = (rgb: number[]): number => {
  const [r, g, b] = rgb.map((c) => c / 255.0);
  return fromRGB(r, g, b);
};

const Item = (props: Props) => {
  const colorThief = new ColorThief();

  const [colourData, setColourData] = useState<ColourData>({});

  useEffect(() => {
    const img = new Image();
    img.src = props.url;
    img.onload = async () => {
      const dominantColour = rgbArrayToHexString(
        await colorThief.getColor(img)
      );
      const palette = await colorThief
        .getPalette(img)
        .map((c: number[]) => rgbArrayToHexString(c));
      // console.log({ c });
      setColourData({ dominantColour, palette });
    };
  });

  return (
    <div className="Item">
      <h2>
        [{props.index}]:#{props.id}
      </h2>
      <img src={props.url} alt="large"></img>
      {colourData && colourData.dominantColour && colourData.palette && (
        <div>
          <Swatch colour={colourData.dominantColour} addClass="dominant" />
          {colourData.palette.map((c) => (
            <Swatch colour={c} addClass="palette" />
          ))}
        </div>
      )}
      <div>
        <code>{JSON.stringify(colourData)}</code>
      </div>
      <div>
        <a href="/transition">Back</a>
      </div>
    </div>
  );
};

const Swatch = (props: { colour: number; addClass: string }) => (
  <div
    className={`swatch ${props.addClass}`}
    style={{
      backgroundColor: `#${props.colour.toString(16)}`,
    }}
  />
);

export default Item;
