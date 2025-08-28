import { useState } from "react";

// Force cache bust - version 2.0
export default function TestComponent() {
  const [count, setCount] = useState(0);

  console.log("🚀 TestComponent rendering - CACHE BUST v2.0");

  return (
    <div style={{ padding: "20px", textAlign: "center", backgroundColor: "#f0f0f0" }}>
      <h1>🚀 NEW TEST COMPONENT v2.0 - CACHE BUST</h1>
      <p style={{ fontSize: "24px", color: "red" }}>Count: {count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{ padding: "10px 20px", fontSize: "18px", backgroundColor: "blue", color: "white" }}
      >
        Click Me! ({count})
      </button>
      <p style={{ marginTop: "20px", fontSize: "14px" }}>
        If you see this, the cache bust worked!
      </p>
    </div>
  );
}
