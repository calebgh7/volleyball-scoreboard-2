import React, { useState } from "react";

export default function StandaloneTest() {
  const [inputValue, setInputValue] = useState("Initial Value");
  const [buttonClicks, setButtonClicks] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("🔧 Standalone input change:", e.target.value);
    setInputValue(e.target.value);
  };

  const handleButtonClick = () => {
    console.log("🔧 Standalone button click:", buttonClicks + 1);
    setButtonClicks(buttonClicks + 1);
  };

  return (
    <div style={{ 
      padding: "40px", 
      fontFamily: "Arial, sans-serif", 
      maxWidth: "800px", 
      margin: "0 auto",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh"
    }}>
      <h1 style={{ color: "#dc3545", textAlign: "center", marginBottom: "40px" }}>
        🚨 STANDALONE REACT TEST 🚨
      </h1>
      
      <div style={{ 
        backgroundColor: "white", 
        padding: "30px", 
        borderRadius: "10px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h2 style={{ color: "#495057", marginBottom: "20px" }}>Test 1: Input Field</h2>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          style={{ 
            padding: "15px", 
            fontSize: "18px", 
            border: "2px solid #007bff", 
            borderRadius: "5px",
            width: "100%",
            marginBottom: "10px"
          }}
          placeholder="Type here to test React input functionality"
        />
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          <strong>Current value:</strong> <span style={{ color: "#28a745" }}>{inputValue}</span>
        </p>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        padding: "30px", 
        borderRadius: "10px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h2 style={{ color: "#495057", marginBottom: "20px" }}>Test 2: Button Click</h2>
        <button
          onClick={handleButtonClick}
          style={{ 
            padding: "15px 30px", 
            fontSize: "18px", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer",
            marginBottom: "10px"
          }}
        >
          Click Me! (Count: {buttonClicks})
        </button>
        <p style={{ fontSize: "16px", color: "#6c757d" }}>
          <strong>Total clicks:</strong> <span style={{ color: "#28a745" }}>{buttonClicks}</span>
        </p>
      </div>

      <div style={{ 
        backgroundColor: "white", 
        padding: "30px", 
        borderRadius: "10px", 
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        marginBottom: "30px"
      }}>
        <h2 style={{ color: "#495057", marginBottom: "20px" }}>Test 3: State Display</h2>
        <div style={{ 
          backgroundColor: "#e9ecef", 
          padding: "20px", 
          borderRadius: "5px",
          fontFamily: "monospace",
          fontSize: "14px"
        }}>
          <p><strong>Input Value:</strong> "{inputValue}"</p>
          <p><strong>Button Clicks:</strong> {buttonClicks}</p>
          <p><strong>Timestamp:</strong> {new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div style={{ 
        backgroundColor: "#fff3cd", 
        border: "1px solid #ffeaa7", 
        borderRadius: "5px", 
        padding: "20px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#856404", marginBottom: "15px" }}>🧪 Instructions</h3>
        <ol style={{ textAlign: "left", color: "#856404" }}>
          <li><strong>Type in the input field</strong> - the text below should update immediately</li>
          <li><strong>Click the button</strong> - the count should increase</li>
          <li><strong>Check the browser console</strong> (F12 → Console) for debug logs</li>
          <li><strong>If both work</strong> - React is functioning correctly</li>
          <li><strong>If neither works</strong> - React is completely broken</li>
        </ol>
      </div>

      <div style={{ 
        backgroundColor: "#d1ecf1", 
        border: "1px solid #bee5eb", 
        borderRadius: "5px", 
        padding: "20px",
        marginTop: "30px",
        textAlign: "center"
      }}>
        <h3 style={{ color: "#0c5460" }}>🔍 Debug Information</h3>
        <p style={{ color: "#0c5460", fontSize: "14px" }}>
          React Version: {React.version} | 
          Build Time: {new Date().toISOString()} |
          User Agent: {navigator.userAgent}
        </p>
      </div>
    </div>
  );
}
