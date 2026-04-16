import React from "react";

export default function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      {icon ? <span>{icon}</span> : null}
      <div>{title}</div>
      <strong>{value}</strong>
    </div>
  );
}
