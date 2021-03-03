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

  return (
    <div className="App">
      <Pattern
        canvasSize={{ width: window.innerWidth, height: window.innerHeight }}
        image={{ src: backgroundSources[bgSourceIndex] }}
      />
      <div className="ui">
        <button
          onClick={() => {
            setBgSource((bgSourceIndex + 1) % backgroundSources.length);
          }}
        >
          Change Background
        </button>
      </div>
    </div>
  );
};

export default App;
