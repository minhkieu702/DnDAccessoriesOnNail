import React, { useState } from "react";
import "./App.css";
import VirtualTryOn from "./component/VirtualTryOn";
import DragDropNailDesign from "./component/DragDropNailDesign";

function App() {
  const [selectedDesign, setSelectedDesign] = useState(null);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Virtual Nail Try-On</h1>

        <DragDropNailDesign onTryOn={setSelectedDesign} />

        {selectedDesign && (
          <div>
            <h2>Virtual Try-On</h2>
            <VirtualTryOn nailDesign={selectedDesign} />
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
