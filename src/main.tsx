import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Handle GitHub Pages redirect
if (window.location.pathname !== '/' && !window.location.pathname.includes('.')) {
  const search = window.location.search;
  const hash = window.location.hash;
  const newPath = window.location.pathname.replace(/\/$/, '');
  
  if (search.includes('p=/')) {
    const redirectPath = search.split('p=/')[1].split('&')[0];
    window.history.replaceState(null, '', redirectPath + hash);
  }
}

createRoot(document.getElementById("root")!).render(<App />);
