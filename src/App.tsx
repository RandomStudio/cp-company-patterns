import React, { useState } from "react";
import "./App.scss";
import Pattern from "./Pattern";

const backgroundSources = [
  "/products/ART45184Q59.JPG",
  "/products/ARCH_.jpg",
  "/products/ARCHCPMAN0_0000096_NNN.jpg",
  "/products/NO-CODE.JPG",
];

const App: React.FunctionComponent<{}> = () => {
  const [bgSourceIndex, setBgSource] = useState(0);
  const [alpha, setAlpha] = useState(1.0);

  const currentSrc = backgroundSources[bgSourceIndex];

  return (
    <div className="App">
      <Pattern
        canvasSize={{ width: window.innerWidth, height: window.innerHeight }}
        image={{ src: currentSrc }}
        alpha={alpha}
      />
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
          value={alpha}
          step="0.1"
          onChange={(e) => setAlpha(parseFloat(e.target.value))}
        ></input>
      </div>
    </div>
  );
};

export default App;
