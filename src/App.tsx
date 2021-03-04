import React, { useState } from "react";
import "./App.scss";
import Pattern, { PatternSettings } from "./Pattern";

const backgroundSources = [
  "/products/ART45184Q59.JPG",
  "/products/ARCH_.jpg",
  "/products/ARCHCPMAN0_0000096_NNN.jpg",
  "/products/NO-CODE.JPG",
  "/objects/Objecst_CP_Magazine_P-E-93.jpg",
  "/objects/Objects_Berlin City_Sound.jpg",
  "/objects/Objects-machine.jpg",
  "/objects/Objects-Notes_2.jpg",
  "/places/Cities-New_York.jpg",
  "/places/Place_Barca(1986).jpg",
  "/places/Place-Palazzo_Dello_Spagnolo_Napoli.JPG",
  "/logos/Logos-Button_2.jpg",
  "/logos/Logos-Button_5.jpg",
  "/logos/Patches-CP_Lens.jpg",
  "/logos/Patches-Garment_Dyed.jpg",
  "/logos/Treams-11CMOW315A_006168A_999.jpg",
];

const App: React.FunctionComponent<{}> = () => {
  const [bgSourceIndex, setBgSource] = useState(0);

  // const currentSrc = backgroundSources[bgSourceIndex];

  const [settings, setSettings] = useState<PatternSettings>({
    overlay: {
      alpha: 1.0,
    },
    grain: {
      useRandom: false,
      magicNumber: 0.456,
      strength: 16.0,
    },
  });

  return (
    <div className="App">
      <Pattern
        image={{ src: backgroundSources[bgSourceIndex] }}
        canvasSize={{ width: window.innerWidth, height: window.innerHeight }}
        settings={{ ...settings }}
      />
      <div className="ui">
        <button
          onClick={() => {
            setBgSource((bgSourceIndex + 1) % backgroundSources.length);
          }}
        >
          Change background
        </button>
        <img
          src={backgroundSources[bgSourceIndex]}
          alt="current texture source"
        />
        <h1>Overlay Effect</h1>
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
        <h1>Grain Effect</h1>
        <input
          type="checkbox"
          id="random"
          value={settings.grain.useRandom === true ? "checked" : "unchecked"}
          onChange={(e) =>
            setSettings({
              ...settings,
              grain: {
                ...settings.grain,
                useRandom: e.target.checked === true,
              },
            })
          }
        />

        <label htmlFor="random">Use random</label>

        <div
          style={{
            display: settings.grain.useRandom === true ? "none" : "block",
          }}
        >
          <label htmlFor="strength">Magic number</label>
          <input
            type="number"
            step="0.1"
            id="strength"
            value={settings.grain.magicNumber}
            onChange={(e) =>
              setSettings({
                ...settings,
                grain: {
                  ...settings.grain,
                  magicNumber: parseFloat(e.target.value),
                },
              })
            }
          />
        </div>

        <div>
          <label htmlFor="strength">Noise strength</label>
          <input
            type="number"
            step="0.1"
            id="strength"
            value={settings.grain.strength}
            onChange={(e) =>
              setSettings({
                ...settings,
                grain: {
                  ...settings.grain,
                  strength: parseFloat(e.target.value),
                },
              })
            }
          />
        </div>
      </div>
    </div>
  );
};

export default App;
