import { createRoot } from "react-dom/client";
import TestComponent from "./test-component";
import "./index.css";

createRoot(document.getElementById("root")!).render(<TestComponent />);
