import { useState } from "react";

export default function SimpleTest() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState("");

  const handleClick = () => {
    setCount(count + 1);
    console.log("Button clicked! Count:", count + 1);
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    console.log("Text changed to:", e.target.value);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Simple React Test</h1>
      
      <div style={{ marginBottom: "20px" }}>
        <h3>Counter Test</h3>
        <p>Count: {count}</p>
        <button 
          onClick={handleClick}
          style={{ 
            padding: "10px 20px", 
            fontSize: "16px", 
            backgroundColor: "#007bff", 
            color: "white", 
            border: "none", 
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          Click Me!
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Input Test</h3>
        <input
          type="text"
          value={text}
          onChange={handleTextChange}
          placeholder="Type something here..."
          style={{ 
            padding: "10px", 
            fontSize: "16px", 
            border: "1px solid #ccc", 
            borderRadius: "5px",
            width: "300px"
          }}
        />
        <p>You typed: "{text}"</p>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>State Display</h3>
        <p>Current count: <strong>{count}</strong></p>
        <p>Current text: <strong>"{text}"</strong></p>
      </div>

      <div style={{ marginTop: "40px", padding: "20px", backgroundColor: "#f8f9fa", borderRadius: "5px" }}>
        <h3>Instructions</h3>
        <ul>
          <li>Click the button - the count should increase</li>
          <li>Type in the input field - the text should update</li>
          <li>Check the console for log messages</li>
          <li>If this works, React is fine. If not, there's a deeper issue.</li>
        </ul>
      </div>
    </div>
  );
}
