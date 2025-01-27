import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
import html2canvas from "html2canvas";

const ItemTypes = {
  ACCESSORY: "accessory",
};

const DraggableAccessory = ({ id, image }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ACCESSORY,
    item: { id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <img
      ref={drag}
      src={image}
      alt="accessory"
      style={{
        width: 50,
        height: 50,
        opacity: isDragging ? 0.5 : 1,
        cursor: "move",
      }}
    />
  );
};

const NailCanvas = ({ onCapture }) => {
  const [accessories, setAccessories] = useState([]);
  const dropRef = useRef(null);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ACCESSORY,
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      setAccessories((prev) => [
        ...prev,
        { id: item.id, x: offset.x, y: offset.y },
      ]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(dropRef);

  const captureDesign = async () => {
    const canvas = await html2canvas(dropRef.current);
    const dataUrl = canvas.toDataURL("image/png");
    onCapture(dataUrl);
  };

  return (
    <div style={{ position: "relative", width: 300, height: 400, border: "1px solid black" }} ref={dropRef}>
      <img src="/base-nail.png" alt="nail" style={{ width: "100%" }} />
      {accessories.map((acc, index) => (
        <img
          key={index}
          src={`/accessory-${acc.id}.png`}
          alt="accessory"
          style={{
            position: "absolute",
            left: acc.x - 150, // Adjust based on container
            top: acc.y - 200,
            width: 50,
            height: 50,
          }}
        />
      ))}
      <button onClick={captureDesign} style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)" }}>
        Try On
      </button>
    </div>
  );
};

const VirtualNailApp = ({ onTryOn }) => {
  return (
    <div>
      <h2>Drag and Drop Accessories</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <DraggableAccessory id={1} image="../assets/accessory1.png" />
        <DraggableAccessory id={2} image="../assets/accessory2.png" />
      </div>
      <NailCanvas onCapture={onTryOn} />
    </div>
  );
};

export default VirtualNailApp;
