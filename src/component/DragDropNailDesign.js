import React, { useRef, useState, useEffect } from "react";
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

const DraggablePlacedAccessory = ({ acc, moveAccessory, removeAccessory }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.ACCESSORY,
    item: { id: acc.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const [, drop] = useDrop(() => ({
    accept: ItemTypes.ACCESSORY,
    hover: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset) return;
      moveAccessory(item.id, offset);
    },
  }));

  return (
    <img
      ref={(node) => drag(drop(node))}
      src={acc.image}
      alt="accessory"
      onClick={() => removeAccessory(acc.id)}
      style={{
        position: "absolute",
        left: acc.x,
        top: acc.y,
        width: 70,
        height: 70,
        cursor: "pointer",
        opacity: isDragging ? 0.5 : 1,
      }}
    />
  );
};

const NailCanvas = () => {
  const [accessories, setAccessories] = useState([]);
  const dropRef = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (imgRef.current) {
      const updateSize = () => {
        setAccessories([]);
      };
      if (imgRef.current.complete) {
        updateSize();
      } else {
        imgRef.current.onload = updateSize;
      }
    }
  }, []);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ItemTypes.ACCESSORY,
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      if (!offset || !dropRef.current) return;
      const dropArea = dropRef.current.getBoundingClientRect();
      const x = offset.x - dropArea.left - 35;
      const y = offset.y - dropArea.top - 35;
      setAccessories((prev) => [...prev, { id: prev.length, image: item.image, x, y }]);
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(dropRef);

  const moveAccessory = (id, offset) => {
    if (!dropRef.current) return;
    const dropArea = dropRef.current.getBoundingClientRect();
    setAccessories((prev) =>
      prev.map((acc) =>
        acc.id === id ? { ...acc, x: offset.x - dropArea.left - 35, y: offset.y - dropArea.top - 35 } : acc
      )
    );
  };

  const removeAccessory = (id) => {
    setAccessories((prev) => prev.filter((acc) => acc.id !== id));
  };

  const captureAndDownload = async () => {
    if (!dropRef.current) return;
    const canvas = await html2canvas(dropRef.current, { backgroundColor: null });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "nail_design.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      ref={dropRef}
      style={{
        position: "relative",
        width: 300,
        height: 400,
        background: "transparent",
        border: "1px solid #ddd",
      }}
    >
      <img ref={imgRef} src="/assets/nail.png" alt="nail" style={{ width: "100%", height: "100%" }} />
      {accessories.map((acc) => (
        <DraggablePlacedAccessory key={acc.id} acc={acc} moveAccessory={moveAccessory} removeAccessory={removeAccessory} />
      ))}
      <button onClick={captureAndDownload} style={{ marginTop: 10 }}>Try-On</button>
    </div>
  );
};

const DragDropNailDesign = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <h2>Drag and Drop Accessories</h2>
      <div style={{ display: "flex", gap: "10px" }}>
        <DraggableAccessory id={1} image="/assets/accessory1.png" />
        <DraggableAccessory id={2} image="/assets/accessory2.png" />
      </div>
      <NailCanvas />
    </DndProvider>
  );
};

export default DragDropNailDesign;
