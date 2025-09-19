import React from "react";

export default function ButtonTest() {
  const openCamera = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment"; // rear camera if available
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        alert(`Selected: ${file.name}`);
      }
    };
    input.click();
  };

  return (
    <div className="p-4">
      <button
        onClick={openCamera}
        className="w-full h-12 bg-green-500 hover:bg-green-600 text-white font-semibold"
      >
        Test Camera
      </button>
    </div>
  );
}
