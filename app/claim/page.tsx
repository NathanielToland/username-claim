import { ClaimWorkspace } from "@/components/ClaimWorkspace";
import { RegistrySidePanel } from "@/components/RegistrySidePanel";

export default async function ClaimPage({
  searchParams,
}: {
  searchParams: Promise<{ handle?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="page-frame claim-layout">
      <section className="claim-layout__lead panel">
        <span className="section-kicker">Claim Desk</span>
        <h1 className="page-title">Handle claim console</h1>
        <p className="page-copy">Search once, verify status, and submit a clean claim on Base.</p>
      </section>
      <ClaimWorkspace initialHandle={params.handle ?? ""} />
      <RegistrySidePanel />
    </main>
  );
}
