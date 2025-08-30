import React from "react";
import { createRoot, Root } from "react-dom/client";
import App from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("#root element not found");

// Reuse the same root across HMR updates to avoid duplicate createRoot warnings
const w = window as any;
const root: Root = w.__app_root ?? createRoot(container);
w.__app_root = root;

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

if (import.meta.hot) {
  import.meta.hot.accept((newModule) => {
    // Re-render the latest App on HMR without re-creating the root
    root.render(
      <React.StrictMode>
        {(newModule?.default ?? App) as unknown as React.ReactElement}
      </React.StrictMode>,
    );
  });
}
