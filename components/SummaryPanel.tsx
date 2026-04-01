import type { ReactNode } from "react";

export function SummaryPanel({
  label,
  value,
  detail,
  accent,
}: {
  label: string;
  value: string;
  detail: string;
  accent?: ReactNode;
}) {
  return (
    <section className="summary-panel panel">
      <div className="summary-panel__meta">
        <span className="eyebrow">{label}</span>
        {accent}
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </section>
  );
}
