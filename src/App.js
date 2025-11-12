import React, { useState } from "react";
import Login from "./Login";
import WifiSimulator from "./WifiSimulator"; // Rename your original App.js code here if needed

export default function App() {
  const [started, setStarted] = useState(false);

  if (!started) {
    return <Login onStart={() => setStarted(true)} />;
  }

  return <WifiSimulator />; // Shows your main Wi-Fi system after clicking Start
}
