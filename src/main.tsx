import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Add error handling
const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Root element not found");
  document.body.innerHTML = '<div style="color: white; padding: 20px;">Error: Root element not found</div>';
} else {
  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log("React app mounted successfully");
  } catch (error) {
    console.error("Error mounting React app:", error);
    rootElement.innerHTML = '<div style="color: white; padding: 20px;">Error loading app. Check console for details.</div>';
  }
}
