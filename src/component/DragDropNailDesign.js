import React, { useRef, useState } from "react";
import { useDrag, useDrop, DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import html2canvas from "html2canvas";

const ItemTypes = {
  ACCESSORY: "accessory",
};

const DraggableAccessory = ({ id, image }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ACCESSORY,
    item: { id, image },
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
        width: 70,
        height: 70,
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
      if (!offset || !dropRef.current) return;
      const dropArea = dropRef.current.getBoundingClientRect();
      const accessorySize = 70; // Kích thước của phụ kiện
      const x = offset.x - dropArea.left - accessorySize / 2; // Căn giữa theo chiều ngang
      const y = offset.y - dropArea.top - accessorySize / 2; // Căn giữa theo chiều dọc
      setAccessories((prev) => [...prev, { id: prev.length, image: item.image, x, y }]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(dropRef);

  const removeAccessory = (index) => {
    setAccessories((prev) => prev.filter((_, i) => i !== index));
  };

  const captureDesign = async () => {
    if (!dropRef.current) return;
    const canvas = await html2canvas(dropRef.current, { backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    onCapture(dataUrl);
  };

  return (
    <div ref={dropRef} style={{ position: "relative", width: 300, height: 400, border: "1px solid black", background: "transparent" }}>
      <img src="/assets/nail.png" alt="nail" style={{ width: "100%" }} />
      {accessories.map((acc, index) => (
        <img
          key={index}
          src={acc.image}
          alt="accessory"
          onClick={() => removeAccessory(index)}
          style={{
            position: "absolute",
            left: acc.x,
            top: acc.y,
            width: 70,
            height: 70,
            cursor: "pointer",
          }}
        />
      ))}
      <button onClick={captureDesign} style={{ marginTop: 10 }}>Try-On</button>
    </div>
  );
};

const DragDropNailDesign = ({ onTryOn }) => {
  return (
    <DndProvider backend={HTML5Backend}>
      <h2>Drag and Drop Accessories</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <DraggableAccessory id={1} image="/assets/accessory1.png" />
        <DraggableAccessory id={2} image="/assets/accessory2.png" />
      </div>
      <NailCanvas onCapture={onTryOn} />
    </DndProvider>
  );
};

export default DragDropNailDesign;
