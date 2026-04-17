import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const AEP_OPTIONS = [
  { label: "1:100", value: 1/100, color: "#ef4444" },
  { label: "1:1,000", value: 1/1000, color: "#f97316" },
  { label: "1:2,475", value: 1/2475, color: "#eab308" },
  { label: "1:5,000", value: 1/5000, color: "#22c55e" },
  { label: "1:10,000", value: 1/10000, color: "#3b82f6" },
  { label: "1:100,000", value: 1/100000, color: "#8b5cf6" },
];

const HORIZONS = [
  { label: "Operación (20 años)", value: 20 },
  { label: "Cierre activo (100 años)", value: 100 },
  { label: "Post-cierre (1,000 años)", value: 1000 },
  { label: "Geológico (10,000 años)", value: 10000 },
];

function calcProb(aep, n) {
  return 1 - Math.pow(1 - aep, n);
}

export default function CumulativeProbability() {
  const [selectedAEPs, setSelectedAEPs] = useState([0, 1, 2, 4]);
  const [maxYears, setMaxYears] = useState(1000);

  const toggleAEP = (idx) => {
    setSelectedAEPs((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const chartData = useMemo(() => {
    const steps = 200;
    const data = [];
    for (let i = 0; i <= steps; i++) {
      const year = Math.round((i / steps) * maxYears);
      const point = { year };
      AEP_OPTIONS.forEach((opt, idx) => {
        if (selectedAEPs.includes(idx)) {
          point[opt.label] = Math.round(calcProb(opt.value, year) * 10000) / 100;
        }
      });
      data.push(point);
    }
    return data;
  }, [selectedAEPs, maxYears]);

  const tableData = useMemo(() => {
    return HORIZONS.map((h) => {
      const row = { horizon: h.label, years: h.value };
      AEP_OPTIONS.forEach((opt) => {
        row[opt.label] = (calcProb(opt.value, h.value) * 100).toFixed(2);
      });
      return row;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Probabilidad Acumulada de Excedencia
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          P(≥1 evento) = 1 − (1 − AEP)<sup>n</sup> — Relación entre horizonte de diseño y evento de diseño
        </p>

        {/* Controls */}
        <div className="flex flex-wrap gap-2 mb-4">
          {AEP_OPTIONS.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => toggleAEP(idx)}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
              style={{
                backgroundColor: selectedAEPs.includes(idx) ? opt.color + "22" : "transparent",
                borderColor: selectedAEPs.includes(idx) ? opt.color : "#4b5563",
                color: selectedAEPs.includes(idx) ? opt.color : "#9ca3af",
              }}
            >
              AEP {opt.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs text-gray-500">Horizonte máximo:</span>
          {[100, 500, 1000, 5000, 10000].map((y) => (
            <button
              key={y}
              onClick={() => setMaxYears(y)}
              className={`px-2 py-1 rounded text-xs transition-all ${
                maxYears === y
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {y.toLocaleString()} años
            </button>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-gray-900 rounded-xl p-4 mb-8 border border-gray-800">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="year"
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                label={{ value: "Años", position: "insideBottomRight", offset: -5, style: { fill: "#9ca3af", fontSize: 11 } }}
              />
              <YAxis
                stroke="#6b7280"
                tick={{ fontSize: 11 }}
                domain={[0, 100]}
                label={{ value: "Probabilidad (%)", angle: -90, position: "insideLeft", style: { fill: "#9ca3af", fontSize: 11 } }}
              />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
                labelStyle={{ color: "#d1d5db" }}
                formatter={(value) => [`${value}%`, ""]}
                labelFormatter={(label) => `Año ${label}`}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {maxYears >= 20 && (
                <ReferenceLine x={20} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Op. 20a", fill: "#6b7280", fontSize: 9, position: "top" }} />
              )}
              {maxYears >= 1000 && (
                <ReferenceLine x={1000} stroke="#6b7280" strokeDasharray="5 5" label={{ value: "Post-cierre 1000a", fill: "#6b7280", fontSize: 9, position: "top" }} />
              )}
              <ReferenceLine y={10} stroke="#ef444444" strokeDasharray="2 2" />
              <ReferenceLine y={50} stroke="#ef444444" strokeDasharray="2 2" />
              {AEP_OPTIONS.map(
                (opt, idx) =>
                  selectedAEPs.includes(idx) && (
                    <Line
                      key={idx}
                      type="monotone"
                      dataKey={opt.label}
                      stroke={opt.color}
                      strokeWidth={2}
                      dot={false}
                      name={`AEP ${opt.label}`}
                    />
                  )
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Table */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-x-auto">
          <h2 className="text-lg font-semibold p-4 pb-2 text-white">
            Tabla de Probabilidades Acumuladas (%)
          </h2>
          <p className="text-xs text-gray-500 px-4 pb-3">
            Probabilidad de experimentar al menos un evento en el horizonte dado
          </p>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-4 py-2 text-gray-400 font-medium">Horizonte</th>
                {AEP_OPTIONS.map((opt) => (
                  <th key={opt.label} className="text-center px-3 py-2 font-medium" style={{ color: opt.color }}>
                    {opt.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.horizon} className="border-b border-gray-800 hover:bg-gray-800/50">
                  <td className="px-4 py-2.5 text-gray-300 font-medium">{row.horizon}</td>
                  {AEP_OPTIONS.map((opt) => {
                    const val = parseFloat(row[opt.label]);
                    let bg = "transparent";
                    if (val > 50) bg = "#ef444420";
                    else if (val > 10) bg = "#f9731620";
                    else if (val > 1) bg = "#eab30815";
                    return (
                      <td
                        key={opt.label}
                        className="text-center px-3 py-2.5 font-mono"
                        style={{ backgroundColor: bg }}
                      >
                        {row[opt.label]}%
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Key insights */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-amber-400 mb-2">Por qué el GISTM usa 1:10,000 AEP en post-cierre</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Un evento 1:10,000 AEP tiene ~9.5% de probabilidad de ocurrir en 1,000 años.
              Este nivel de riesgo residual es aceptable bajo el principio ALARP. Eventos menos
              severos (e.g. 1:1,000) tendrían ~63% de probabilidad — inaceptable para una estructura
              sin supervisión activa.
            </p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
            <h3 className="text-sm font-semibold text-blue-400 mb-2">Por qué ANCOLD exige PMF en cierre</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              ANCOLD adopta un enfoque más conservador: el PMF es teóricamente el máximo evento
              posible. Para un horizonte de 1,000 años sin mantenimiento activo, ANCOLD considera
              que incluso el 9.5% de riesgo de 1:10,000 justifica ir al límite superior absoluto (PMF).
              Además exige evaluar eventos acumulativos (múltiples sismos menores).
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mt-6 text-center">
          Fuentes: ANCOLD 2012/2019 · GISTM · ICMM Good Practice Guide 2021
        </p>
      </div>
    </div>
  );
}
