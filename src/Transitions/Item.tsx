// @ts-ignore
import ColorThief from "colorthief";
import { useEffect, useState } from "react";
interface Props {
  index: number;
  id: number;
  url: string;
}

interface ColourData {
  dominantColour?: number[];
  palette?: number[][];
}

const Item = (props: Props) => {
  const colorThief = new ColorThief();

  const [colourData, setColourData] = useState<ColourData>({});

  useEffect(() => {
    const img = new Image();
    img.src = props.url;
    img.onload = async () => {
      const dominantColour = await colorThief.getColor(img);
      const palette = await colorThief.getPalette(img);
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
      <code>{JSON.stringify(colourData)}</code>
      <div>
        <a href="/transition">Back</a>
      </div>
    </div>
  );
};

export default Item;
