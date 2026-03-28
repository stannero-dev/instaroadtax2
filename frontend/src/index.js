import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

const removeEmergentBranding = () => {
  const selectors = [
    "#emergent-badge",
    'a[href*="app.emergent.sh"]',
    'script[src*="assets.emergent.sh"]',
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((node) => node.remove());
  });

  document.querySelectorAll("a, p, div, span").forEach((node) => {
    if (node.textContent?.trim() === "Made with Emergent") {
      const badge = node.closest("a, div");
      if (badge) badge.remove();
      else node.remove();
    }
  });
};

removeEmergentBranding();
new MutationObserver(removeEmergentBranding).observe(document.documentElement, {
  childList: true,
  subtree: true,
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
