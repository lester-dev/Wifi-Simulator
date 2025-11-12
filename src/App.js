import React, { useState } from "react";
import Login from "./Login";
import WifiSimulator from "./WifiSimulator";
import { Analytics } from "@vercel/analytics/react"; // ✅ Import this

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <>
      {/* Render Login or Main App */}
      {!started ? (
        <Login onStart={() => setStarted(true)} />
      ) : (
        <WifiSimulator />
      )}

      {/* ✅ Add Analytics at the very bottom */}
      <Analytics />
    </>
  );
}
