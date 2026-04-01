import Link from "next/link";
import { registryPreview } from "@/lib/mock-data";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";

export function RegistrySidePanel() {
  return (
    <aside className="registry-side panel">
      <div className="registry-side__head">
        <span className="section-kicker">Registry Feed</span>
        <Link href="/registry" className="ghost-link">
          Open Registry
        </Link>
      </div>
      <div className="registry-side__records">
        {registryPreview.map((entry) => (
          <article key={entry.handle} className="registry-side__record">
            <div>
              <strong>@{entry.handle}</strong>
              <span>{entry.timestamp}</span>
            </div>
            <UsernameStatusChip status={entry.status} />
          </article>
        ))}
      </div>
    </aside>
  );
}
