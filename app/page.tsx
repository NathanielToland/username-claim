import Link from "next/link";
import { ActivityStrip } from "@/components/ActivityStrip";
import { RegistrySidePanel } from "@/components/RegistrySidePanel";
import { SummaryPanel } from "@/components/SummaryPanel";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";

export default function HomePage() {
  return (
    <main className="page-frame home-layout">
      <section className="home-sidebar panel">
        <span className="section-kicker">Bureau Status</span>
        <h1 className="page-title">Claim a name that holds its line on Base.</h1>
        <p className="page-copy">
          Check availability, lock ownership, and manage a single registry identity from one handle bureau.
        </p>
        <div className="home-sidebar__actions">
          <Link href="/claim" className="claim-button">
            Claim Username
          </Link>
          <Link href="/my" className="secondary-button">
            View My Username
          </Link>
        </div>
      </section>

      <section className="home-center panel">
        <div className="home-center__hero">
          <span className="section-kicker">Availability Priority</span>
          <div className="home-center__row">
            <div>
              <span className="eyebrow">Primary action</span>
              <h2>@your-handle</h2>
            </div>
            <UsernameStatusChip status="available" />
          </div>
          <p>Use the claim desk to check a handle and turn an open record into an owned identity.</p>
        </div>
        <div className="home-center__grid">
          <SummaryPanel
            label="Registry mode"
            value="Single-claim"
            detail="Each handle is unique and resolved through the Base registry contract."
          />
          <SummaryPanel
            label="Claim result"
            value="Immediate"
            detail="Availability and ownership updates refresh after claim confirmation."
            accent={<UsernameStatusChip status="pending" />}
          />
        </div>
        <ActivityStrip />
      </section>

      <RegistrySidePanel />
    </main>
  );
}
