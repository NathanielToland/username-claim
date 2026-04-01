import { availabilitySamples } from "@/lib/mock-data";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";

export function ActivityStrip() {
  return (
    <section className="activity-strip panel">
      <div className="activity-strip__header">
        <span className="section-kicker">Live Samples</span>
        <span className="eyebrow">Status priority</span>
      </div>
      <div className="activity-strip__items">
        {availabilitySamples.map((sample) => (
          <div key={sample.handle} className="activity-strip__item">
            <strong>@{sample.handle}</strong>
            <UsernameStatusChip status={sample.status} />
          </div>
        ))}
      </div>
    </section>
  );
}
