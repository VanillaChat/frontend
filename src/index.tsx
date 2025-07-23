import React from "react";
import ReactDOM from "react-dom/client";
import {RouterProvider} from "react-router-dom";
import {enableMapSet} from "immer";
import "@/i18n";
import ThemeProvider from "@/context/ThemeProvider";
import {router} from "@/utils/router";

enableMapSet();

function App() {
  return (
      <ThemeProvider>
        <RouterProvider router={router} />
      </ThemeProvider>
  )
}

const container = document.getElementById('app-root');
if (!container) throw new Error("Root element not found");

declare global {
  interface HTMLElement {
    _reactRoot?: ReactDOM.Root;
  }
}

let root: ReactDOM.Root;
if (container._reactRoot) {
  root = container._reactRoot;
} else {
  root = ReactDOM.createRoot(container);
  container._reactRoot = root;
}

root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
);

export default App;