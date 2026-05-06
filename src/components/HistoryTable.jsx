function HistoryTable({ history, onExport }) {
  if (!history.length) return null;

  const badgeClass = (level) =>
    level === "Low" ? "badge badge-low" :
    level === "Medium" ? "badge badge-medium" :
    "badge badge-high";

  return (
    <div className="card" style={{ marginTop: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div className="section-title">📋 Prediction History</div>
        <button className="btn-export" onClick={onExport}>⬇️ Export CSV</button>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="history-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Hour</th>
              <th>Temp (°C)</th>
              <th>Humidity</th>
              <th>Season</th>
              <th>Holiday</th>
              <th>Predicted</th>
              <th>Demand</th>
            </tr>
          </thead>
          <tbody>
            {history.map((row, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>{row.date}</td>
                <td>{row.hour}:00</td>
                <td>{row.temperature}°C</td>
                <td>{row.humidity}%</td>
                <td>{row.seasons}</td>
                <td>{row.holiday}</td>
                <td><strong>{row.prediction}</strong></td>
                <td><span className={badgeClass(row.demand_level)}>{row.demand_level}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default HistoryTable;