import { useState } from "react";
import axios from "axios";
import ResultCard from "./ResultCard";
import HistoryTable from "./HistoryTable";
import DemandChart from "./DemandChart";

const API = import.meta.env.VITE_API_URL || "";

const PRESETS = {
  "☀️ Hot Summer Day": {
    temperature: 32, humidity: 45, wind_speed: 1.2, visibility: 2000,
    solar_radiation: 2.8, rainfall: 0.0, snowfall: 0.0,
    seasons: "Summer", holiday: "No Holiday", functioning_day: "Yes"
  },
  "🌧️ Rainy Day": {
    temperature: 15, humidity: 90, wind_speed: 3.5, visibility: 500,
    solar_radiation: 0.2, rainfall: 5.0, snowfall: 0.0,
    seasons: "Spring", holiday: "No Holiday", functioning_day: "Yes"
  },
  "❄️ Cold Winter Morning": {
    temperature: -4, humidity: 70, wind_speed: 2.0, visibility: 800,
    solar_radiation: 0.1, rainfall: 0.0, snowfall: 3.0,
    seasons: "Winter", holiday: "No Holiday", functioning_day: "Yes"
  },
  "🍂 Autumn Evening": {
    temperature: 18, humidity: 60, wind_speed: 1.8, visibility: 1500,
    solar_radiation: 0.8, rainfall: 0.0, snowfall: 0.0,
    seasons: "Spring", holiday: "No Holiday", functioning_day: "Yes"
  }
};

const DEFAULT_FORM = {
  date: "10/06/2023", hour: 12, temperature: 25, humidity: 55,
  wind_speed: 1.5, visibility: 1000, solar_radiation: 0.5,
  rainfall: 0.0, snowfall: 0.0, seasons: "Summer",
  holiday: "No Holiday", functioning_day: "Yes"
};

const FIELDS = [
  { name: "date",            label: "Date",                    type: "text",   hint: "DD/MM/YYYY" },
  { name: "hour",            label: "Hour",                    type: "number", hint: "0 – 23",    min: 0,   max: 23   },
  { name: "temperature",     label: "Temperature (°C)",        type: "number", hint: "-20 to 45", min: -20, max: 45   },
  { name: "humidity",        label: "Humidity (%)",            type: "number", hint: "0 – 100",   min: 0,   max: 100  },
  { name: "wind_speed",      label: "Wind Speed (m/s)",        type: "number", hint: "0 – 30",    min: 0,   max: 30   },
  { name: "visibility",      label: "Visibility (10m)",        type: "number", hint: "0 – 2000",  min: 0,   max: 2000 },
  { name: "solar_radiation", label: "Solar Radiation (MJ/m²)", type: "number", hint: "0 – 3.5",   min: 0,   max: 3.5  },
  { name: "rainfall",        label: "Rainfall (mm)",           type: "number", hint: "0 – 35",    min: 0,   max: 35   },
  { name: "snowfall",        label: "Snowfall (cm)",           type: "number", hint: "0 – 10",    min: 0,   max: 10   },
];

function PredictionForm() {
  const [form, setForm]               = useState(DEFAULT_FORM);
  const [result, setResult]           = useState(null);
  const [demandLevel, setDemandLevel] = useState(null);
  const [loading, setLoading]         = useState(false);
  const [dayLoading, setDayLoading]   = useState(false);
  const [error, setError]             = useState(null);
  const [history, setHistory]         = useState([]);
  const [hourlyData, setHourlyData]   = useState(null);
  const [errors, setErrors]           = useState({});
  const [tab, setTab]                 = useState("single");

  const validate = () => {
    const e = {};
    if (!form.date.match(/^\d{2}\/\d{2}\/\d{4}$/))       e.date        = "Use DD/MM/YYYY format";
    if (form.hour < 0 || form.hour > 23)                  e.hour        = "Must be 0–23";
    if (form.temperature < -20 || form.temperature > 45)  e.temperature = "Must be -20 to 45";
    if (form.humidity < 0 || form.humidity > 100)         e.humidity    = "Must be 0–100";
    return e;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: null });
  };

  const applyPreset = (preset) => {
    setForm((prev) => ({ ...prev, ...PRESETS[preset] }));
    setResult(null);
    setHourlyData(null);
    setError(null);
  };

  // ── Single Hour Predict ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/predict`, {
        ...form,
        hour:            parseInt(form.hour),
        temperature:     parseFloat(form.temperature),
        humidity:        parseInt(form.humidity),
        wind_speed:      parseFloat(form.wind_speed),
        visibility:      parseInt(form.visibility),
        solar_radiation: parseFloat(form.solar_radiation),
        rainfall:        parseFloat(form.rainfall),
        snowfall:        parseFloat(form.snowfall),
      });

      const pred  = res.data.prediction;
      const level = res.data.demand_level;
      setResult(pred);
      setDemandLevel(level);
      setHistory((prev) => [
        { ...form, prediction: pred, demand_level: level },
        ...prev
      ]);
    } catch {
      setError("❌ Cannot connect to Flask backend. Make sure it is running.");
    } finally {
      setLoading(false);
    }
  };

  // ── 24-Hour Forecast ──────────────────────────────────────────────────────
  const handleDayForecast = async () => {
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }

    setDayLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API}/predict_day`, {
        ...form,
        temperature:     parseFloat(form.temperature),
        humidity:        parseInt(form.humidity),
        wind_speed:      parseFloat(form.wind_speed),
        visibility:      parseInt(form.visibility),
        solar_radiation: parseFloat(form.solar_radiation),
        rainfall:        parseFloat(form.rainfall),
        snowfall:        parseFloat(form.snowfall),
      });
      setHourlyData(res.data);
      setTab("forecast");
    } catch {
      setError("❌ Cannot connect to Flask backend. Make sure it is running.");
    } finally {
      setDayLoading(false);
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const res = await axios.post(
        `${API}/export_csv`,
        { history },
        { responseType: "blob" }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const a    = document.createElement("a");
      a.href     = url;
      a.download = "prediction_history.csv";
      a.click();
    } catch {
      alert("Export failed. Make sure backend is running.");
    }
  };

  return (
    <div style={{ padding: "0 16px 40px" }}>

      {/* ── Tabs ── */}
      <div className="tab-row" style={{ maxWidth: 1100, margin: "20px auto 0" }}>
        <button className={`tab-btn ${tab === "single"   ? "active" : ""}`} onClick={() => setTab("single")}>
          🔍 Single Hour Prediction
        </button>
        <button className={`tab-btn ${tab === "forecast" ? "active" : ""}`} onClick={() => setTab("forecast")}>
          📊 24-Hour Forecast
        </button>
        <button className={`tab-btn ${tab === "history"  ? "active" : ""}`} onClick={() => setTab("history")}>
          📋 History {history.length > 0 && `(${history.length})`}
        </button>
      </div>

      {/* ── Input Card ── */}
      <div className="card">
        <div className="section-title">⚙️ Input Parameters</div>

        {/* Presets */}
        <div className="presets">
          {Object.keys(PRESETS).map((p) => (
            <button key={p} className="preset-btn" onClick={() => applyPreset(p)}>{p}</button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            {FIELDS.map(({ name, label, type, hint, min, max }) => (
              <div className="form-group" key={name}>
                <label>{label}</label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  min={min}
                  max={max}
                  step={type === "number" ? "any" : undefined}
                />
                {errors[name]
                  ? <span className="error-msg">⚠ {errors[name]}</span>
                  : <span className="hint">{hint}</span>
                }
              </div>
            ))}

            {/* Dropdowns */}
            <div className="form-group">
              <label>Season</label>
              <select name="seasons" value={form.seasons} onChange={handleChange}>
                {["Spring", "Summer", "Autumn", "Winter"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Holiday</label>
              <select name="holiday" value={form.holiday} onChange={handleChange}>
                <option>No Holiday</option>
                <option>Holiday</option>
              </select>
            </div>
            <div className="form-group">
              <label>Functioning Day</label>
              <select name="functioning_day" value={form.functioning_day} onChange={handleChange}>
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="btn-row">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <><span className="spinner"></span>Predicting...</> : "🔍 Predict This Hour"}
            </button>
            <button type="button" className="btn-secondary" onClick={handleDayForecast} disabled={dayLoading}>
              {dayLoading ? <><span className="spinner"></span>Loading...</> : "📊 Full Day Forecast"}
            </button>
          </div>
        </form>

        {error && <div className="error-box">{error}</div>}
      </div>

      {/* ── Single Result ── */}
      {tab === "single" && result !== null && (
        <div className="card" style={{ marginTop: 20, textAlign: "center" }}>
          <ResultCard result={result} demandLevel={demandLevel} />
        </div>
      )}

      {/* ── Day Forecast Chart ── */}
      {tab === "forecast" && hourlyData && (
        <>
          <div className="card" style={{ marginTop: 20, display: "flex", gap: 32 }}>
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: 4 }}>TOTAL DAY DEMAND</div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{hourlyData.total_day_demand.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", opacity: 0.6, marginBottom: 4 }}>PEAK HOUR</div>
              <div style={{ fontSize: "2rem", fontWeight: 800 }}>{hourlyData.peak_hour.label}</div>
              <div style={{ fontSize: "0.82rem", opacity: 0.6 }}>{hourlyData.peak_hour.prediction} bikes</div>
            </div>
          </div>
          <DemandChart hourly={hourlyData.hourly} />
        </>
      )}

      {/* ── History Table ── */}
      {tab === "history" && (
        <HistoryTable history={history} onExport={handleExport} />
      )}

    </div>
  );
}

export default PredictionForm;