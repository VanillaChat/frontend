import React from "react";
import "../styles/Index.css";
import useMeta from "../hooks/useMeta";

function Index() {
  useMeta("Home");
  return (
    <main className="home">
      <div className="App">
        <h1>Do something here</h1>
      </div>
    </main>
  );
}

export default Index;
