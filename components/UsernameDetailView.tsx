"use client";

import Link from "next/link";
import { useReadContract } from "wagmi";
import { ActionBar } from "@/components/ActionBar";
import { CopyUsernameButton } from "@/components/CopyUsernameButton";
import { EmptyState } from "@/components/EmptyState";
import { SummaryPanel } from "@/components/SummaryPanel";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";
import { CONTRACT_ADDRESS, usernameAbi } from "@/lib/contract";
import { normalizeHandle, shortenAddress } from "@/lib/format";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export function UsernameDetailView({ handle }: { handle: string }) {
  const normalized = normalizeHandle(handle);
  const ownerQuery = useReadContract({
    abi: usernameAbi,
    address: CONTRACT_ADDRESS,
    functionName: "ownerOfName",
    args: normalized ? [normalized] : undefined,
    query: {
      enabled: Boolean(normalized),
    },
  });

  const owner = ownerQuery.data as string | undefined;
  const exists = Boolean(owner && owner !== zeroAddress);

  if (!exists && !ownerQuery.isLoading) {
    return (
      <EmptyState
        title="Username not claimed"
        detail="This registry record is still open for a new owner."
        ctaHref={`/claim?handle=${normalized}`}
        ctaLabel="Claim This Username"
      />
    );
  }

  return (
    <div className="detail-layout">
      <section className="detail-hero panel">
        <span className="section-kicker">Ownership Detail</span>
        <div className="detail-hero__titleRow">
          <h1>@{normalized}</h1>
          <UsernameStatusChip status="claimed" />
        </div>
        <p className="page-copy">This registry record is claimed on Base and linked to one owner address.</p>
        <ActionBar>
          <CopyUsernameButton value={`@${normalized}`} />
          <Link className="ghost-link" href="/registry">
            Back to Registry
          </Link>
        </ActionBar>
      </section>

      <div className="detail-grid">
        <SummaryPanel label="Owner address" value={shortenAddress(owner)} detail="The address currently assigned to this username." />
        <SummaryPanel
          label="Claim state"
          value="Locked"
          detail="The contract enforces one owner per handle."
          accent={<UsernameStatusChip status="claimed" />}
        />
        <SummaryPanel label="Lookup source" value="Base mainnet" detail="Live contract read from the username registry contract." />
      </div>
    </div>
  );
}
