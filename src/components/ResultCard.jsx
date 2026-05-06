function ResultCard({ result, demandLevel }) {
  const badgeClass =
    demandLevel === "Low" ? "badge badge-low" :
    demandLevel === "Medium" ? "badge badge-medium" :
    "badge badge-high";

  return (
    <div style={{ textAlign: "center", padding: "12px 0" }}>
      <div className="result-number">{Math.round(result)}</div>
      <div className="result-label">Expected bikes for this hour</div>
      {demandLevel && (
        <div style={{ marginTop: "12px" }}>
          <span className={badgeClass}>{demandLevel} Demand</span>
        </div>
      )}
    </div>
  );
}

export default ResultCard;