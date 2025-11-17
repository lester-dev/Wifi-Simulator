import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from "recharts";
import { Wifi, Smartphone } from "lucide-react";

//
// Helper: Format 1.556e-8 → 1.556 × 10⁻⁸
//
function formatScientific(value, precision = 3) {
  if (value === 0 || !isFinite(value)) return "0";
  const [mantissa, exponent] = value.toExponential(precision).split("e");
  const exp = parseInt(exponent, 10);
  const superscriptDigits = {
    "-": "⁻",
    "0": "⁰",
    "1": "¹",
    "2": "²",
    "3": "³",
    "4": "⁴",
    "5": "⁵",
    "6": "⁶",
    "7": "⁷",
    "8": "⁸",
    "9": "⁹",
  };
  const expFormatted = String(exp)
    .split("")
    .map((ch) => superscriptDigits[ch] || ch)
    .join("");
  return `${parseFloat(mantissa)} × 10${expFormatted}`;
}

export default function App() {
  const [distance, setDistance] = useState(6);
  const maxDistance = 20; // Maximum distance (meters)
  const Ptx = 100; // Transmit power in mW
  const fMHz = 2400; // Wi-Fi frequency

  function calcSignalPercent(dMeters) {
    const dKm = dMeters / 1000; // convert meters to km
    if (dMeters <= 0)
      return { strength: 0, dbm: -Infinity, I: 0, pathLoss: 0, Icorrected: 0, dKm };

    const I = Ptx / (4 * Math.PI * dMeters * dMeters); // 1️⃣ Inverse-square law
    const pathLoss = 20 * Math.log10(dKm) + 20 * Math.log10(fMHz) + 32.44; // 2️⃣ FSPL
    const Icorrected = I * Math.pow(10, -pathLoss / 10); // 3️⃣ Corrected power
    const dbm = 10 * Math.log10(Icorrected); // 4️⃣ Convert to dBm
    const strength = 100 / (1 + Math.exp(-(dbm + 65) / 5)); // 5️⃣ Signal %

    // Compute approximate Mbps (simple model: max 100 Mbps)
    const maxMbps = 100;
    const mbps = Math.round((strength / 100) * maxMbps);

    return {
      strength: Number(strength.toFixed(1)),
      dbm: Number(dbm.toFixed(2)),
      I,
      pathLoss,
      Icorrected,
      dKm,
      mbps,
    };
  }

  const { strength: signalPercent, dbm, I, pathLoss, Icorrected, dKm, mbps } =
    calcSignalPercent(distance);

  // Chart data
  const chartData = useMemo(() => {
    return Array.from({ length: maxDistance }, (_, i) => {
      const m = i + 1;
      const { strength, dbm } = calcSignalPercent(m);
      return { distance: m, strength, dbm };
    });
  }, [maxDistance]);

  const getColorFor = (pct) => {
    if (pct > 70) return "#16a34a";
    if (pct > 40) return "#f59e0b";
    return "#dc2626";
  };

  const color = getColorFor(signalPercent);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-sky-50 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-xl p-6">
        <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-2">
          <h1 className="text-2xl font-bold text-slate-800">
            📶 Wi-Fi Signal Strength Simulator
          </h1>
          <div className="text-sm text-slate-600">
            This uses 2.4GHz frequency. Transmit Power: 100mW.
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Column */}
          <div className="w-full md:w-1/2 flex flex-col gap-6">
            {/* Box: Router + Device + Slider + Legend */}
            <div className="w-full bg-white border border-slate-100 rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow flex flex-col gap-6">
              {/* Wi-Fi Animation */}
              <div className="relative flex flex-col md:flex-row items-center justify-center h-56 w-full">
                {/* Router */}
                <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 h-48 md:h-full">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {[1, 2, 3].map((n) => {
                      const baseOpacity = Math.max(0, signalPercent / 100 - n * 0.08);
                      const size = 60 + n * 36;
                      return (
                        <motion.div
                          key={n}
                          className="absolute rounded-full"
                          style={{
                            width: size,
                            height: size,
                            border: `2px solid rgba(56,189,248, ${Math.max(
                              0.06,
                              baseOpacity
                            )})`,
                          }}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [baseOpacity, baseOpacity * 0.35, baseOpacity],
                          }}
                          transition={{
                            duration: 2.2 + n * 0.6,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      );
                    })}
                  </div>
                  <div className="relative z-10 flex flex-col items-center">
                    <Wifi size={48} className="text-sky-500" />
                    <div className="text-xs text-slate-500 mt-2">Router</div>
                  </div>
                </div>

                {/* Device */}
                <div className="relative flex flex-col items-center justify-center w-full md:w-1/2 mt-6 md:mt-0">
                  <motion.div
                    style={{ width: "100%" }}
                    animate={{
                      x:
                        typeof window !== "undefined" && window.innerWidth >= 768
                          ? `calc(${((distance - 1) / (maxDistance - 1)) * 100}% - 22px)`
                          : "50%",
                      translateX:
                        typeof window !== "undefined" && window.innerWidth < 768
                          ? "-50%"
                          : "0",
                    }}
                    transition={{ type: "spring", stiffness: 90 }}
                  >
                    <Smartphone size={44} className="text-slate-700" />
                  </motion.div>
                  <div className="text-xs text-slate-500 mt-2">Device</div>
                </div>
              </div>

              {/* Slider + Signal */}
              <div className="mt-4">
                <label className="text-sm font-medium text-slate-700">
                  Distance: <span className="font-semibold">{distance} m</span>
                </label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="relative w-full">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-300 transform -translate-y-1/2 rounded"></div>
                    <input
                      type="range"
                      min="1"
                      max={maxDistance}
                      value={distance}
                      onChange={(e) => setDistance(Number(e.target.value))}
                      className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer accent-sky-500 relative z-10"
                    />
                  </div>
                  <div className="w-36 text-right">
                    <div className="text-lg font-bold" style={{ color }}>
                      {signalPercent}%
                    </div>
                    <div className="text-xs text-slate-500">{dbm} dBm</div>
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex gap-4 items-center">
                <LegendDot color="#16a34a" label="Strong" />
                <LegendDot color="#f59e0b" label="Moderate" />
                <LegendDot color="#dc2626" label="Weak" />
              </div>
            </div>

            {/* Step-by-step solution */}
            <div className="w-full bg-white border border-slate-100 rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow flex flex-col gap-6">
              <h3 className="font-semibold mb-2">📘 Step-by-Step Calculation:</h3>
              <p className="mb-2">
                <strong>1️⃣ Inverse-Square Law:</strong><br />
                I = P / (4πR²) = 100 / (4π({distance})²) ={" "}
                <strong>{formatScientific(I)} mW</strong>
              </p>
              <p className="mb-2">
                <strong>2️⃣ FSPL:</strong><br />
                FSPL = 20log₁₀(d<sub>km</sub>) + 20log₁₀(f<sub>MHz</sub>) + 32.44<br />
                = 20log₁₀({dKm.toFixed(4)}) + 20log₁₀(2400) + 32.44 ={" "}
                <strong>{pathLoss.toFixed(2)} dB</strong>
              </p>
              <p className="mb-2">
                <strong>3️⃣ Corrected Power:</strong><br />
                I<sub>corrected</sub> = I × 10<sup>-FSPL/10</sup> ={" "}
                <strong>{formatScientific(Icorrected)} mW</strong>
              </p>
              <p className="mb-2">
                <strong>4️⃣ Convert to dBm:</strong><br />
                P<sub>dBm</sub> = 10log₁₀(P<sub>mW</sub>) ={" "}
                <strong>{dbm.toFixed(2)} dBm</strong>
              </p>
            </div>
          </div>

          {/* Right Column: Chart + Summary aligned to top of left bottom box */}
          <div className="w-full md:w-1/2 flex flex-col gap-7">
            {/* Chart Box */}
            <div className="w-full aspect-[4/3] bg-white border border-slate-100 rounded-xl p-3 shadow-md hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-slate-700">
                  Signal vs Distance
                </div>
                <div className="text-xs text-slate-500">Free-Space 2.4 GHz</div>
              </div>

              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{ top: 16, right: 24, left: 24, bottom: 24 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="distance"
                    ticks={[5, 10, 15, 20]}
                    label={{ value: "Distance (m)", position: "insideBottom", offset: -6 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    label={{ value: "Signal (%)", angle: -90, position: "insideLeft", dx: -8 }}
                  />
                  <RechartTooltip
                    formatter={(value, name, props) => {
                      const { payload } = props;
                      return [`${value.toFixed(1)}% (${payload.dbm.toFixed(1)} dBm)`, "Signal Strength"];
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="strength"
                    stroke={color}
                    strokeWidth={3}
                    dot={(props) => {
                      const { cx, cy, payload } = props;
                      if (!cx) return null;
                      const isCurrent = payload.distance === distance;
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isCurrent ? 5 : 2}
                          fill={isCurrent ? color : "#2563eb"}
                          stroke="#fff"
                          strokeWidth={isCurrent ? 1.5 : 0}
                        />
                      );
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Summary Box aligned to top */}
            <div className="w-full bg-white border border-slate-100 rounded-xl p-4 shadow-md hover:shadow-xl transition-shadow">
              <h3 className="font-semibold text-slate-800 mb-4">📊 Summary</h3>
              <div className="flex flex-wrap">
                <div className="w-1/2 p-2 border-b border-r border-slate-200 flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-slate-500 mb-1">Signal Strength</div>
                  <div className="text-lg font-bold text-slate-800">{signalPercent}%</div>
                </div>

                <div className="w-1/2 p-2 border-b border-slate-200 flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-slate-500 mb-1">Power</div>
                  <div className="text-lg font-bold text-slate-800">{dbm} dBm</div>
                </div>

                <div className="w-1/2 p-2 border-r border-slate-200 flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-slate-500 mb-1">Distance</div>
                  <div className="text-lg font-bold text-slate-800">{distance} m</div>
                </div>

                <div className="w-1/2 p-2 flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-slate-500 mb-1">Mbps</div>
                  <div className="text-lg font-bold text-slate-800">{mbps} Mbps</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

//
// Legend Dot Component
//
function LegendDot({ color, label }) {
  return (
    <div className="flex items-center gap-2">
      <div style={{ background: color }} className="w-4 h-4 rounded-full shadow-sm" />
      <div className="text-sm text-slate-700">{label}</div>
    </div>
  );
}
