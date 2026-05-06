import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine
} from "recharts";

const COLORS = {
  Low: "#10b981",
  Medium: "#fbbf24",
  High: "#ef4444"
};

function DemandChart({ hourly }) {
  if (!hourly || !hourly.length) return null;

  const avg = Math.round(hourly.reduce((s, r) => s + r.prediction, 0) / hourly.length);

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <div className="section-title">📊 24-Hour Demand Forecast</div>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={hourly} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94a3b8" }}
            interval={2}
          />
          <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
          <Tooltip
            contentStyle={{ background: "#1a1d27", border: "1px solid #2d3148", borderRadius: 8 }}
            labelStyle={{ color: "#e2e8f0" }}
            formatter={(val, name) => [`${val} bikes`, "Predicted"]}
          />
          <ReferenceLine y={avg} stroke="#6366f1" strokeDasharray="4 4" label={{ value: `Avg: ${avg}`, fill: "#818cf8", fontSize: 11 }} />
          <Bar dataKey="prediction" radius={[4, 4, 0, 0]}>
            {hourly.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.demand_level] || "#6366f1"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: "0.78rem", opacity: 0.7 }}>
        <span>🟢 Low (&le;200)</span>
        <span>🟡 Medium (201–600)</span>
        <span>🔴 High (&gt;600)</span>
      </div>
    </div>
  );
}

export default DemandChart;