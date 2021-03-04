import React, { useState } from "react";
import "./App.scss";
import Pattern, { PatternProps } from "./Pattern";

const backgroundSources = [
  "/products/ART45184Q59.JPG",
  "/products/ARCH_.jpg",
  "/products/ARCHCPMAN0_0000096_NNN.jpg",
  "/products/NO-CODE.JPG",
  "/objects/Objecst_CP_Magazine_P-E-93.jpg",
  "/objects/Objects_Berlin City_Sound.jpg",
  "/objects/Objects-machine.jpg",
  "/objects/Objects-Notes_2.jpg",
];

const App: React.FunctionComponent<{}> = () => {
  const [bgSourceIndex, setBgSource] = useState(0);

  const currentSrc = backgroundSources[bgSourceIndex];

  const [settings, setSettings] = useState<PatternProps>({
    image: {
      src: currentSrc,
    },
    canvasSize: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    overlay: {
      alpha: 1.0,
    },
    grain: {
      magicNumber: 0.456,
      strength: 16.0,
    },
  });

  return (
    <div className="App">
      <Pattern {...settings} />
      <div className="ui">
        <button
          onClick={() => {
            setBgSource((bgSourceIndex + 1) % backgroundSources.length);
          }}
        >
          Change background
        </button>

        <img src={currentSrc} alt="current texture source" />

        <label htmlFor="alpha">Alpha</label>
        <input
          id="alpha"
          type="number"
          value={settings.overlay.alpha}
          step="0.1"
          onChange={(e) =>
            setSettings({
              ...settings,
              overlay: {
                alpha: parseFloat(e.target.value),
              },
            })
          }
        ></input>
      </div>
    </div>
  );
};

export default App;
