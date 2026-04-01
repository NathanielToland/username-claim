"use client";

import Link from "next/link";
import { useAccount, useReadContract } from "wagmi";
import { EmptyState } from "@/components/EmptyState";
import { OwnershipCard } from "@/components/OwnershipCard";
import { SummaryPanel } from "@/components/SummaryPanel";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";
import { CONTRACT_ADDRESS, usernameAbi } from "@/lib/contract";
import { shortenAddress } from "@/lib/format";

export function MyUsernamePanel() {
  const { address, isConnected } = useAccount();
  const ownedNameQuery = useReadContract({
    abi: usernameAbi,
    address: CONTRACT_ADDRESS,
    functionName: "nameOfUser",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const ownedName = (ownedNameQuery.data as string | undefined) ?? "";

  if (!isConnected) {
    return (
      <EmptyState
        title="Wallet connection required"
        detail="Connect a wallet to inspect your personal registry record."
        ctaHref="/claim"
        ctaLabel="Open Claim Desk"
      />
    );
  }

  if (!ownedName) {
    return (
      <EmptyState
        title="No username claimed"
        detail="This wallet does not hold a registry handle yet."
        ctaHref="/claim"
        ctaLabel="Claim Username"
      />
    );
  }

  return (
    <div className="my-username-layout">
      <OwnershipCard handle={ownedName} owner={address} status="claimed" href={`/usernames/${ownedName}`} />
      <div className="my-username-layout__rail">
        <SummaryPanel
          label="Registry state"
          value="Active"
          detail="The current wallet record resolves to one claimed username."
          accent={<UsernameStatusChip status="claimed" />}
        />
        <SummaryPanel
          label="Wallet"
          value={shortenAddress(address)}
          detail="Ownership is tied directly to the connected Base address."
        />
        <Link className="secondary-button" href={`/usernames/${ownedName}`}>
          Open Ownership Detail
        </Link>
      </div>
    </div>
  );
}
