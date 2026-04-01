import Link from "next/link";
import { registryPreview } from "@/lib/mock-data";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";

export default function RegistryPage() {
  return (
    <main className="page-frame registry-page">
      <section className="registry-page__hero panel">
        <span className="section-kicker">Public Registry</span>
        <h1 className="page-title">Recent handle records</h1>
        <p className="page-copy">A lightweight public view of current username states and ownership signals.</p>
      </section>

      <section className="registry-table panel">
        {registryPreview.map((entry) => (
          <Link key={entry.handle} href={`/usernames/${entry.handle}`} className="registry-table__row">
            <div>
              <span className="eyebrow">Handle</span>
              <strong>@{entry.handle}</strong>
            </div>
            <div>
              <span className="eyebrow">Owner</span>
              <strong>{entry.owner}</strong>
            </div>
            <div>
              <span className="eyebrow">Status</span>
              <UsernameStatusChip status={entry.status} />
            </div>
            <div>
              <span className="eyebrow">Time</span>
              <strong>{entry.timestamp}</strong>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
