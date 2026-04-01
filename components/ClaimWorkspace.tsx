"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ActionBar } from "@/components/ActionBar";
import { AvailabilityIndicator } from "@/components/AvailabilityIndicator";
import { ClaimUsernameButton } from "@/components/ClaimUsernameButton";
import { SummaryPanel } from "@/components/SummaryPanel";
import { UsernameClaimInput } from "@/components/UsernameClaimInput";
import { UsernameStatusChip } from "@/components/UsernameStatusChip";
import { APP_ID, APP_NAME_LABEL, CONTRACT_ADDRESS, usernameAbi } from "@/lib/contract";
import { isHandleValid, normalizeHandle, shortenAddress } from "@/lib/format";
import { trackTransaction } from "@/utils/track";

const zeroAddress = "0x0000000000000000000000000000000000000000";

type Props = {
  initialHandle?: string;
};

export function ClaimWorkspace({ initialHandle = "" }: Props) {
  const [input, setInput] = useState(initialHandle);
  const [checkedHandle, setCheckedHandle] = useState(normalizeHandle(initialHandle));
  const [hasChecked, setHasChecked] = useState(Boolean(initialHandle));
  const { address, isConnected } = useAccount();
  const normalizedInput = useMemo(() => normalizeHandle(input), [input]);
  const handleIsValid = isHandleValid(normalizedInput);

  const ownerQuery = useReadContract({
    abi: usernameAbi,
    address: CONTRACT_ADDRESS,
    functionName: "ownerOfName",
    args: checkedHandle ? [checkedHandle] : undefined,
    query: {
      enabled: Boolean(checkedHandle && hasChecked && handleIsValid),
    },
  });

  const ownedNameQuery = useReadContract({
    abi: usernameAbi,
    address: CONTRACT_ADDRESS,
    functionName: "nameOfUser",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const { data: hash, error, isPending, writeContract } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (receipt.isSuccess && hash && address) {
      trackTransaction(APP_ID, APP_NAME_LABEL, address, hash);
      void ownerQuery.refetch();
      void ownedNameQuery.refetch();
    }
  }, [address, hash, ownerQuery, ownedNameQuery, receipt.isSuccess]);

  const owner = ownerQuery.data as string | undefined;
  const hasOwner = Boolean(owner && owner !== zeroAddress);
  const ownedName = (ownedNameQuery.data as string | undefined) ?? "";
  const userOwnsName = ownedName.length > 0;

  let availabilityStatus: "idle" | "checking" | "available" | "taken" | "claimed" | "pending" | "invalid" = "idle";
  let detail = "Search the registry to confirm whether a handle can be claimed.";

  if (normalizedInput && !handleIsValid) {
    availabilityStatus = "invalid";
    detail = "Use 2 to 20 characters with letters, numbers, dots, or hyphens.";
  } else if (ownerQuery.isFetching) {
    availabilityStatus = "checking";
    detail = "Registry lookup in progress.";
  } else if (hasChecked && checkedHandle && hasOwner) {
    availabilityStatus = "taken";
    detail = `This handle is already held by ${shortenAddress(owner)}.`;
  } else if (hasChecked && checkedHandle && !hasOwner && handleIsValid) {
    availabilityStatus = "available";
    detail = "This handle is open for claim on Base.";
  }

  if (receipt.isPending || isPending) {
    availabilityStatus = "pending";
    detail = "Claim transaction submitted. Waiting for final confirmation.";
  }

  if (receipt.isSuccess && normalizedInput === checkedHandle) {
    availabilityStatus = "claimed";
    detail = "Claim confirmed. The registry record is now assigned.";
  }

  const canClaim =
    isConnected &&
    handleIsValid &&
    hasChecked &&
    checkedHandle === normalizedInput &&
    availabilityStatus === "available" &&
    !userOwnsName;

  return (
    <div className="claim-workspace">
      <UsernameClaimInput
        value={input}
        onChange={setInput}
        onCheck={() => {
          setCheckedHandle(normalizedInput);
          setHasChecked(true);
          void ownerQuery.refetch();
        }}
        disabled={!normalizedInput || !handleIsValid}
      />

      <AvailabilityIndicator status={availabilityStatus} detail={detail} />

      <ActionBar>
        <ClaimUsernameButton
          busy={isPending || receipt.isPending}
          disabled={!canClaim}
          onClick={() =>
            writeContract({
              abi: usernameAbi,
              address: CONTRACT_ADDRESS,
              functionName: "claim",
              args: [normalizedInput],
            })
          }
        />
        <Link className="ghost-link" href={normalizedInput ? `/usernames/${normalizedInput}` : "/registry"}>
          View Detail
        </Link>
      </ActionBar>

      <div className="claim-metrics">
        <SummaryPanel
          label="Wallet record"
          value={userOwnsName ? `@${ownedName}` : "No username"}
          detail={userOwnsName ? "Current username assigned to this wallet." : "Connect a wallet and claim a unique handle."}
          accent={userOwnsName ? <UsernameStatusChip status="claimed" /> : <UsernameStatusChip status="status" />}
        />
        <SummaryPanel
          label="Checked handle"
          value={normalizedInput ? `@${normalizedInput}` : "@pending"}
          detail={hasChecked ? detail : "No registry lookup submitted yet."}
          accent={<UsernameStatusChip status={availabilityStatus === "idle" ? "status" : availabilityStatus} />}
        />
      </div>

      {error ? <p className="feedback error">{error instanceof Error ? error.message : "Claim failed."}</p> : null}
      {receipt.isSuccess && hash ? (
        <p className="feedback success">
          Claim confirmed. Transaction hash: <span>{hash}</span>
        </p>
      ) : null}
      {!isConnected ? <p className="feedback neutral">Connect a wallet before claiming a username.</p> : null}
      {userOwnsName ? (
        <p className="feedback neutral">
          This wallet already holds <strong>@{ownedName}</strong>. The current contract keeps a single visible username record for the address.
        </p>
      ) : null}
    </div>
  );
}


