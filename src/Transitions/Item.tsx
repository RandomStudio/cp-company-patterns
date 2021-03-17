// @ts-ignore
import ColorThief from "colorthief";
import { fromRGB } from "hex-color-utils";
import { useEffect, useState } from "react";
interface Props {
  index: number;
  id: number;
  url: string;
}

interface ColourData {
  dominantColour?: string;
  palette?: string[];
}

const rgbArrayToHexString = (rgb: number[]): string => {
  const [r, g, b] = rgb.map((c) => c / 255.0);
  return fromRGB(r, g, b).toString(16);
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
          <div
            className="swatch dominant"
            style={{
              backgroundColor: `#${colourData.dominantColour}`,
            }}
          />
          {colourData.palette.map((c) => (
            <div
              className="swatch palette"
              style={{ backgroundColor: `#${c}` }}
            ></div>
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

export default Item;
