import React from "react";

export default function MinimalTest() {
  const [count, setCount] = React.useState(0);
  const [text, setText] = React.useState("");

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Minimal React Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>State Test</h3>
        <p>Count: {count}</p>
        <button 
          onClick={() => setCount(count + 1)}
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none" 
          }}
        >
          Increment
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Input Test</h3>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ 
            padding: "10px", 
            fontSize: "16px", 
            border: "1px solid #000", 
            width: "300px" 
          }}
        />
        <p>Text: {text}</p>
      </div>

      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f0f0f0" }}>
        <h3>Instructions</h3>
        <p>1. Click the button - count should increase</p>
        <p>2. Type in the input - text should update</p>
        <p>3. If neither works, React is completely broken</p>
      </div>
    </div>
  );
}
