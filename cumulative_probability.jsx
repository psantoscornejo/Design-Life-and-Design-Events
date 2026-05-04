import { useState, useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from "recharts";

const AEP_OPTIONS = [
  { label: "1:5",       value: 1/5,      color: "#f43f5e" },
  { label: "1:10",      value: 1/10,     color: "#14b8a6" },
  { label: "1:15",      value: 1/15,     color: "#a78bfa" },
  { label: "1:100",     value: 1/100,    color: "#ef4444" },
  { label: "1:1,000",   value: 1/1000,   color: "#f97316" },
  { label: "1:2,475",   value: 1/2475,   color: "#eab308" },
  { label: "1:5,000",   value: 1/5000,   color: "#22c55e" },
  { label: "1:10,000",  value: 1/10000,  color: "#3b82f6" },
  { label: "1:100,000", value: 1/100000, color: "#8b5cf6" },
];

const HORIZONS = [
  { label: "Design Life 1 yr",          value: 1,     group: "design" },
  { label: "Design Life 3 yrs",         value: 3,     group: "design" },
  { label: "Design Life 5 yrs",         value: 5,     group: "design" },
  { label: "Design Life 10 yrs",        value: 10,    group: "design" },
  { label: "Operations (20 yrs)",       value: 20,    group: "standard" },
  { label: "Design Life 50 yrs",        value: 50,    group: "design" },
  { label: "Active Closure (100 yrs)",  value: 100,   group: "standard" },
  { label: "Post-Closure (1,000 yrs)",  value: 1000,  group: "standard" },
  { label: "Geological (10,000 yrs)",   value: 10000, group: "standard" },
];

function calcProb(aep, n) {
  return 1 - Math.pow(1 - aep, n);
}

// ─── Calculator Tab ──────────────────────────────────────────────────────────

function CalculatorTab() {
  const [selectedAEPs, setSelectedAEPs] = useState([0, 1, 2, 3, 7]);
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
      const row = { horizon: h.label, years: h.value, group: h.group };
      AEP_OPTIONS.forEach((opt) => {
        row[opt.label] = (calcProb(opt.value, h.value) * 100).toFixed(2);
      });
      return row;
    });
  }, []);

  return (
    <>
      {/* AEP toggles */}
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

      {/* Horizon selector */}
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xs text-gray-500">Max horizon:</span>
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
            {y.toLocaleString()} yrs
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
              label={{ value: "Years", position: "insideBottomRight", offset: -5, style: { fill: "#9ca3af", fontSize: 11 } }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fontSize: 11 }}
              domain={[0, 100]}
              label={{ value: "Probability (%)", angle: -90, position: "insideLeft", style: { fill: "#9ca3af", fontSize: 11 } }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px" }}
              labelStyle={{ color: "#d1d5db" }}
              formatter={(value) => [`${value}%`, ""]}
              labelFormatter={(label) => `Year ${label}`}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {maxYears >= 20 && (
              <ReferenceLine x={20} stroke="#6b7280" strokeDasharray="5 5"
                label={{ value: "Ops. 20yr", fill: "#6b7280", fontSize: 9, position: "top" }} />
            )}
            {maxYears >= 1000 && (
              <ReferenceLine x={1000} stroke="#6b7280" strokeDasharray="5 5"
                label={{ value: "Post-closure 1000yr", fill: "#6b7280", fontSize: 9, position: "top" }} />
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
          Cumulative Probability Table (%)
        </h2>
        <p className="text-xs text-gray-500 px-4 pb-3">
          Probability of experiencing at least one exceedance event over the given horizon
        </p>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left px-4 py-2 text-gray-400 font-medium">Horizon</th>
              {AEP_OPTIONS.map((opt) => (
                <th key={opt.label} className="text-center px-3 py-2 font-medium" style={{ color: opt.color }}>
                  {opt.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.map((row) => (
              <tr
                key={row.horizon}
                className="border-b border-gray-800 hover:bg-gray-800/50"
                style={row.group === "design" ? { borderLeft: "2px solid #14b8a630" } : {}}
              >
                <td className="px-4 py-2.5 font-medium"
                  style={{ color: row.group === "design" ? "#94a3b8" : "#d1d5db" }}>
                  {row.horizon}
                </td>
                {AEP_OPTIONS.map((opt) => {
                  const val = parseFloat(row[opt.label]);
                  let bg = "transparent";
                  if (val > 50) bg = "#ef444420";
                  else if (val > 10) bg = "#f9731620";
                  else if (val > 1) bg = "#eab30815";
                  return (
                    <td key={opt.label} className="text-center px-3 py-2.5 font-mono"
                      style={{ backgroundColor: bg }}>
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
          <h3 className="text-sm font-semibold text-amber-400 mb-2">
            Why GISTM uses 1:10,000 AEP for post-closure
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            A 1:10,000 AEP event has a ~9.5% probability of occurring within 1,000 years.
            This residual risk level is acceptable under the ALARP principle. Less severe events
            (e.g. 1:1,000) would carry ~63% probability — unacceptable for a structure without
            active supervision.
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-4">
          <h3 className="text-sm font-semibold text-blue-400 mb-2">
            Why ANCOLD requires PMF at closure
          </h3>
          <p className="text-xs text-gray-400 leading-relaxed">
            ANCOLD takes a more conservative approach: the PMF is theoretically the maximum
            possible event. For a 1,000-year horizon without active maintenance, ANCOLD considers
            that even the 9.5% risk of a 1:10,000 event justifies designing for the absolute
            upper limit (PMF). It also requires evaluating cumulative events (multiple smaller
            earthquakes).
          </p>
        </div>
      </div>
    </>
  );
}

// ─── Formulas & Guide Tab ────────────────────────────────────────────────────

function FormulaGuideTab() {
  const exAEP = 1 / 2475;
  const exN = 50;
  const exP = calcProb(exAEP, exN);

  const workedSteps = [
    {
      step: "1",
      color: "text-teal-400",
      title: "Identify the AEP",
      body: "Design event is 1:2,475 AEP  →  T = 2,475 yrs  →  AEP = 1/2,475 ≈ 0.000404 (0.0404 %/yr)",
    },
    {
      step: "2",
      color: "text-violet-400",
      title: "Identify the design life (n)",
      body: "Exposure period is n = 50 years (operating phase).",
    },
    {
      step: "3",
      color: "text-amber-400",
      title: "Compute annual non-exceedance probability",
      body: "1 − AEP  =  1 − 0.000404  =  0.999596",
    },
    {
      step: "4",
      color: "text-amber-400",
      title: "Raise to the power n",
      body: "(1 − AEP)ⁿ  =  (0.999596)⁵⁰  ≈  0.9800",
    },
    {
      step: "5",
      color: "text-rose-400",
      title: "Compute the cumulative probability",
      body: `P  =  1 − 0.9800  =  ${(exP * 100).toFixed(2)}%  ≈  2.0%`,
    },
    {
      step: "✓",
      color: "text-green-400",
      title: "Interpret the result",
      body: "There is approximately a 2% probability of experiencing at least one 1:2,475 AEP seismic event during the 50-year operating life. This is generally considered acceptable under ALARP for operating structures.",
    },
  ];

  const quickRef = [
    { event: "1:5",       aep: 1/5,      n: 1,     context: "Annual flood screening" },
    { event: "1:10",      aep: 1/10,     n: 3,     context: "Short construction phase" },
    { event: "1:15",      aep: 1/15,     n: 5,     context: "Short operating permit" },
    { event: "1:100",     aep: 1/100,    n: 20,    context: "Operations (flood)" },
    { event: "1:1,000",   aep: 1/1000,   n: 100,   context: "Active closure (flood)" },
    { event: "1:2,475",   aep: 1/2475,   n: 50,    context: "Operations (seismic — ASCE 7)" },
    { event: "1:2,475",   aep: 1/2475,   n: 1000,  context: "Post-closure (seismic)" },
    { event: "1:10,000",  aep: 1/10000,  n: 1000,  context: "Post-closure (GISTM benchmark)" },
    { event: "1:100,000", aep: 1/100000, n: 10000, context: "Geological horizon" },
  ];

  const benchmarks = [
    {
      color: "border-amber-500",
      titleColor: "text-amber-400",
      title: "GISTM (2020) — Tailings Dams",
      body: "Post-closure design event: 1:10,000 AEP for both flood and seismic. Over 1,000 years this yields ~9.5% cumulative probability — accepted as the ALARP threshold for unattended structures.",
      highlight: "1:10,000 AEP",
    },
    {
      color: "border-blue-500",
      titleColor: "text-blue-400",
      title: "ANCOLD (2012/2019) — Dams",
      body: "Requires PMF (Probable Maximum Flood) at closure for High and Extreme consequence dams. Considers that 9.5% residual risk over 1,000 years justifies design to the absolute upper limit.",
      highlight: "PMF",
    },
    {
      color: "border-green-500",
      titleColor: "text-green-400",
      title: "ICMM Good Practice Guide (2021)",
      body: "Recommends aligning design life probabilities with GISTM. Uses cumulative exceedance charts to demonstrate that design events for long-life structures must be very rare to maintain acceptable residual risk.",
      highlight: null,
    },
    {
      color: "border-violet-500",
      titleColor: "text-violet-400",
      title: "ASCE 7 — Buildings (Seismic)",
      body: "Risk-Targeted Maximum Considered Earthquake (MCER): 1:2,475 AEP (~2% probability of exceedance in 50 years). Directly applies this formula for design seismic hazard.",
      highlight: "1:2,475 AEP",
    },
    {
      color: "border-rose-500",
      titleColor: "text-rose-400",
      title: "ALARP Principle",
      body: "Risk must be reduced As Low As Reasonably Practicable. Common tolerable risk thresholds: <10⁻⁴/yr (broadly acceptable) and <10⁻⁶/yr (negligible). Cumulative probability must be considered alongside individual annual risk.",
      highlight: null,
    },
    {
      color: "border-teal-500",
      titleColor: "text-teal-400",
      title: "Rule of Thumb — 10% in design life",
      body: "A widely used benchmark: choose an AEP such that cumulative probability over the design life is approximately 10%. This corresponds roughly to a return period T ≈ 10 × n for short design lives.",
      highlight: "~10%",
    },
  ];

  return (
    <div className="space-y-8">

      {/* Core formula */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Core Formula</h2>
        <div className="bg-gray-950 rounded-lg p-5 text-center border border-gray-700 mb-5">
          <p className="text-3xl font-mono text-amber-300 tracking-wide">
            P&nbsp;=&nbsp;1&nbsp;−&nbsp;(1&nbsp;−&nbsp;AEP)<sup className="text-xl">n</sup>
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          {[
            {
              label: "P",
              color: "text-amber-300",
              desc: "Cumulative probability of experiencing at least one exceedance event over n years.",
              note: "Range: 0 → 1  (0 % → 100 %)",
            },
            {
              label: "AEP — Annual Exceedance Probability",
              color: "text-teal-300",
              desc: "Probability the event is equalled or exceeded in any single year. Also written as 1/T where T is the return period.",
              note: "1:100 AEP  →  AEP = 0.01  (1 %/yr)",
            },
            {
              label: "n — Design Life (years)",
              color: "text-violet-300",
              desc: "Number of years over which the probability is evaluated. Also called the exposure period or design horizon.",
              note: "e.g. 50-year dam operating life",
            },
          ].map(({ label, color, desc, note }) => (
            <div key={label} className="bg-gray-800/60 rounded-lg p-3">
              <p className={`font-semibold ${color} mb-1`}>{label}</p>
              <p className="text-gray-300 leading-relaxed">{desc}</p>
              <p className="text-gray-500 mt-1 font-mono">{note}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Key concepts */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Key Concepts</h2>
        <div className="space-y-5 text-xs">
          <div>
            <p className="font-semibold text-white mb-1">Return Period (T) vs AEP</p>
            <p className="text-gray-400 leading-relaxed">
              The return period T is the average number of years between occurrences of an event of a given
              magnitude. AEP and T are related by{" "}
              <span className="font-mono text-amber-300">AEP = 1 / T</span>. A 1:100 AEP event has T = 100 years,
              meaning on average it occurs once every 100 years.{" "}
              <strong className="text-white">
                This does NOT mean the event cannot occur twice in 100 years
              </strong>{" "}
              — each year is an independent trial.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">The Binomial Model (independent annual trials)</p>
            <p className="text-gray-400 leading-relaxed">
              Each year is treated as a Bernoulli trial: the event either occurs (probability = AEP) or does
              not (probability = 1 − AEP). Over n independent years, the probability of{" "}
              <em>zero</em> exceedances is{" "}
              <span className="font-mono text-amber-300">(1 − AEP)ⁿ</span>. The complement gives the
              probability of <em>at least one</em> exceedance:{" "}
              <span className="font-mono text-amber-300">P = 1 − (1 − AEP)ⁿ</span>.
            </p>
          </div>
          <div>
            <p className="font-semibold text-white mb-1">Why not simply multiply AEP × n?</p>
            <p className="text-gray-400 leading-relaxed">
              The naive estimate AEP × n overestimates probability, especially for high-AEP events or long
              horizons. Example: 1:10 AEP over 15 years → naive = 150% (impossible). Correct formula:{" "}
              <span className="font-mono text-amber-300">1 − (1 − 0.1)¹⁵ = 79.4%</span>. The binomial
              model is always the correct approach.
            </p>
          </div>
        </div>
      </div>

      {/* Step-by-step */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Step-by-Step Manual Calculation</h2>
        <p className="text-xs text-gray-400 mb-6">
          Worked example:{" "}
          <strong className="text-white">
            What is the probability of experiencing at least one 1:2,475 AEP seismic event over a
            50-year operating life?
          </strong>
        </p>
        <div className="space-y-4">
          {workedSteps.map(({ step, color, title, body }) => (
            <div key={step} className="flex gap-4">
              <div
                className={`w-7 h-7 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-bold ${color} border-current`}
              >
                {step}
              </div>
              <div>
                <p className={`text-xs font-semibold ${color} mb-0.5`}>{title}</p>
                <p className="text-xs text-gray-400 leading-relaxed font-mono">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick reference table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Quick Reference — Manual Calculation Examples</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left px-3 py-2 text-gray-400">Design Event (AEP)</th>
                <th className="text-center px-3 py-2 text-gray-400">n (years)</th>
                <th className="text-center px-3 py-2 text-gray-400">AEP value</th>
                <th className="text-center px-3 py-2 text-gray-400">(1 − AEP)ⁿ</th>
                <th className="text-center px-3 py-2 text-amber-300 font-semibold">P (%)</th>
                <th className="text-left px-3 py-2 text-gray-400">Typical context</th>
              </tr>
            </thead>
            <tbody>
              {quickRef.map(({ event, aep, n, context }) => {
                const nonExc = Math.pow(1 - aep, n);
                const p = (1 - nonExc) * 100;
                const pColor =
                  p > 50 ? "text-red-400" : p > 10 ? "text-orange-400" : p > 1 ? "text-yellow-400" : "text-gray-300";
                return (
                  <tr key={`${event}-${n}`} className="border-b border-gray-800 hover:bg-gray-800/50">
                    <td className="px-3 py-2 font-mono text-teal-300">{event}</td>
                    <td className="text-center px-3 py-2 font-mono">{n.toLocaleString()}</td>
                    <td className="text-center px-3 py-2 font-mono text-gray-400">{aep.toExponential(3)}</td>
                    <td className="text-center px-3 py-2 font-mono text-gray-400">{nonExc.toFixed(4)}</td>
                    <td className={`text-center px-3 py-2 font-mono font-semibold ${pColor}`}>
                      {p.toFixed(2)}%
                    </td>
                    <td className="px-3 py-2 text-gray-500">{context}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Useful approximations */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Useful Approximations</h2>
        <div className="grid md:grid-cols-3 gap-4 text-xs">
          <div className="bg-gray-800/60 rounded-lg p-4">
            <p className="font-semibold text-amber-300 mb-2">When AEP is very small</p>
            <p className="text-gray-400 mb-2">For rare events (AEP &lt; 0.01), the formula simplifies to:</p>
            <p className="font-mono text-white text-sm">P ≈ AEP × n</p>
            <p className="text-gray-500 mt-2">Error &lt; 1% when AEP &lt; 0.001</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-4">
            <p className="font-semibold text-teal-300 mb-2">The 63% rule</p>
            <p className="text-gray-400 mb-2">
              When n = T (design life equals return period), probability is always ~63%:
            </p>
            <p className="font-mono text-white text-sm">P ≈ 1 − e⁻¹ ≈ 63.2%</p>
            <p className="text-gray-500 mt-2">Useful as a sanity check</p>
          </div>
          <div className="bg-gray-800/60 rounded-lg p-4">
            <p className="font-semibold text-violet-300 mb-2">Required return period</p>
            <p className="text-gray-400 mb-2">
              To achieve target probability P* over n years, solve for T:
            </p>
            <p className="font-mono text-white text-sm">T = −n / ln(1 − P*)</p>
            <p className="text-gray-500 mt-2">P* = 10%, n = 50  →  T ≈ 475 yrs</p>
          </div>
        </div>
      </div>

      {/* Engineering benchmarks */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Engineering Benchmarks &amp; Standards</h2>
        <div className="grid md:grid-cols-2 gap-4 text-xs">
          {benchmarks.map(({ color, titleColor, title, body }) => (
            <div key={title} className={`border-l-2 ${color} pl-3`}>
              <p className={`font-semibold ${titleColor} mb-1`}>{title}</p>
              <p className="text-gray-400 leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function CumulativeProbability() {
  const [activeTab, setActiveTab] = useState("calculator");

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
          Cumulative Exceedance Probability
        </h1>
        <p className="text-gray-400 text-sm mb-6">
          P(≥1 event) = 1 − (1 − AEP)<sup>n</sup> — Relationship between design horizon and design event
        </p>

        {/* Tab navigation */}
        <div className="flex gap-1 mb-8 border-b border-gray-800">
          {[
            { id: "calculator", label: "Calculator" },
            { id: "guide",      label: "Formulas & Guide" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "calculator" ? <CalculatorTab /> : <FormulaGuideTab />}

        <p className="text-xs text-gray-600 mt-8 text-center">
          Sources: ANCOLD 2012/2019 · GISTM 2020 · ICMM Good Practice Guide 2021 · ASCE 7
        </p>
      </div>
    </div>
  );
}
