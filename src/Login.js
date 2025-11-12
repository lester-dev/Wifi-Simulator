import React from "react";

export default function Login({ onStart }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-slate-50 flex flex-col items-center justify-center p-6">
      {/* Title */}
      <h1 className="text-4xl font-bold text-sky-600 mb-4 text-center">
        Welcome to Wi-Fi Signal Simulator
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-slate-700 mb-8 text-center max-w-md">
        This system demonstrates how distance affects Wi-Fi signal strength
      </p>


      {/* Start Button */}
      <button
        onClick={onStart}
        className="px-8 py-4 bg-sky-500 text-white font-semibold rounded-xl shadow-lg hover:bg-sky-600 transition-colors duration-300"
      >
        Start
      </button>

      {/* Optional footer text */}
      <p className="text-xs text-slate-500 mt-6 text-center">
        Click Start to begin the simulation.
      </p>

    </div>
  );
}
