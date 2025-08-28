import React, { useState } from "react";

export default function BasicInputTest() {
  const [inputValue, setInputValue] = useState("Initial Value");
  const [buttonClicks, setButtonClicks] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("Input change event fired:", e.target.value);
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    console.log("Button click event fired");
    setButtonClicks(buttonClicks + 1);
  };

  const handleDivClick = () => {
    console.log("Div click event fired");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Basic Input Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Input Test</h3>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{ 
            padding: "10px", 
            fontSize: "16px", 
            border: "1px solid #000", 
            width: "300px" 
          }}
        />
        <p>Current value: <strong>{inputValue}</strong></p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Button Test</h3>
        <button 
          onClick={handleButtonClick}
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none" 
          }}
        >
          Click Me ({buttonClicks})
        </button>
      </div>

      <div 
        onClick={handleDivClick}
        style={{ 
          marginBottom: "20px", 
          padding: "20px", 
          backgroundColor: "#f0f0f0", 
          border: "2px solid #ccc",
          cursor: "pointer"
        }}
      >
        <h3>Clickable Div Test</h3>
        <p>Click this div - it should log to console</p>
      </div>

      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#e9ecef", border: "1px solid #dee2e6" }}>
        <h3>Debug Info</h3>
        <p>Input value: <code>{inputValue}</code></p>
        <p>Button clicks: <code>{buttonClicks}</code></p>
        <p>Check browser console for event logs</p>
      </div>
    </div>
  );
}
