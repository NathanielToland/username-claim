"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
  useSwitchChain,
} from "wagmi";
import { base } from "wagmi/chains";
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
  const [actionMessage, setActionMessage] = useState("");
  const [activeHash, setActiveHash] = useState<`0x${string}` | undefined>();
  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const normalizedInput = useMemo(() => normalizeHandle(input), [input]);
  const handleIsValid = isHandleValid(normalizedInput);
  const onBase = chainId === base.id;

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

  const { data, error, isPending, writeContractAsync, reset } = useWriteContract();
  const receipt = useWaitForTransactionReceipt({
    hash: activeHash,
    query: {
      enabled: Boolean(activeHash),
    },
  });

  useEffect(() => {
    if (data && data !== activeHash) {
      setActiveHash(data);
      setActionMessage("Transaction submitted. Waiting for Base confirmation...");
    }
  }, [activeHash, data]);

  useEffect(() => {
    if (receipt.isSuccess && activeHash && address) {
      setActionMessage("Claim confirmed and registry data refreshed.");
      trackTransaction(APP_ID, APP_NAME_LABEL, address, activeHash);
      void ownerQuery.refetch();
      void ownedNameQuery.refetch();
    }
  }, [activeHash, address, ownerQuery, ownedNameQuery, receipt.isSuccess]);

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

  if (receipt.isPending || isPending || isSwitchingChain) {
    availabilityStatus = "pending";
    detail = isSwitchingChain
      ? "Switching wallet network to Base."
      : "Claim transaction submitted. Waiting for final confirmation.";
  }

  if (receipt.isSuccess && normalizedInput === checkedHandle) {
    availabilityStatus = "claimed";
    detail = "Claim confirmed. The registry record is now assigned.";
  }

  if (receipt.isError && activeHash) {
    detail = "This transaction did not confirm. Review the hash and try again.";
  }

  const runCheck = async () => {
    if (!normalizedInput) {
      setActionMessage("Enter a username before checking availability.");
      return;
    }

    if (!handleIsValid) {
      setActionMessage("Use 2 to 20 characters with letters, numbers, dots, or hyphens.");
      return;
    }

    setActionMessage("Checking live registry status...");
    setCheckedHandle(normalizedInput);
    setHasChecked(true);
    await ownerQuery.refetch();
  };

  const resetTransactionState = () => {
    setActiveHash(undefined);
    setActionMessage("Claim state reset. You can check and submit again.");
    reset();
  };

  const runClaim = async () => {
    if (!isConnected) {
      setActionMessage("Connect a wallet before submitting a claim.");
      return;
    }

    if (!onBase) {
      setActionMessage("Switching to Base before submitting the claim...");
      try {
        await switchChainAsync({ chainId: base.id });
      } catch (switchError) {
        setActionMessage(switchError instanceof Error ? switchError.message : "Switch to Base and try again.");
        return;
      }
    }

    if (!normalizedInput) {
      setActionMessage("Enter a username to continue.");
      return;
    }

    if (!handleIsValid) {
      setActionMessage("This username format is invalid.");
      return;
    }

    if (userOwnsName) {
      setActionMessage(`This wallet already holds @${ownedName}.`);
      return;
    }

    if (!hasChecked || checkedHandle !== normalizedInput) {
      await runCheck();
      setActionMessage("Availability refreshed. Review the status, then press claim again.");
      return;
    }

    if (availabilityStatus !== "available") {
      setActionMessage(detail);
      return;
    }

    setActionMessage("Opening wallet confirmation...");

    try {
      const hash = await writeContractAsync({
        abi: usernameAbi,
        address: CONTRACT_ADDRESS,
        functionName: "claim",
        args: [normalizedInput],
      });
      setActiveHash(hash);
      setActionMessage("Transaction submitted. Waiting for Base confirmation...");
    } catch (claimError) {
      setActionMessage(claimError instanceof Error ? claimError.message : "Unable to open the claim request.");
    }
  };

  const canClaim = isConnected && handleIsValid && !userOwnsName && !isPending && !receipt.isPending && !isSwitchingChain;

  return (
    <div className="claim-workspace">
      <UsernameClaimInput value={input} onChange={setInput} onCheck={() => void runCheck()} disabled={ownerQuery.isFetching} />

      <AvailabilityIndicator status={availabilityStatus} detail={detail} />

      <ActionBar>
        <ClaimUsernameButton busy={isPending || receipt.isPending || isSwitchingChain} disabled={!canClaim} onClick={() => void runClaim()} />
        <Link className="ghost-link" href={normalizedInput ? `/usernames/${normalizedInput}` : "/registry"}>
          View Detail
        </Link>
        {activeHash ? (
          <a className="ghost-link" href={`https://basescan.org/tx/${activeHash}`} target="_blank" rel="noreferrer">
            Open Transaction
          </a>
        ) : null}
        {(activeHash || error || receipt.isError) ? (
          <button type="button" className="secondary-button" onClick={resetTransactionState}>
            Reset Claim State
          </button>
        ) : null}
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

      {actionMessage ? <p className="feedback neutral">{actionMessage}</p> : null}
      {error ? <p className="feedback error">{error instanceof Error ? error.message : "Claim failed."}</p> : null}
      {receipt.isError ? <p className="feedback error">This transaction did not confirm on Base. Reset the claim state and try again.</p> : null}
      {receipt.isSuccess && activeHash ? (
        <p className="feedback success">
          Claim confirmed. Transaction hash: <span>{activeHash}</span>
        </p>
      ) : null}
      {!isConnected ? <p className="feedback neutral">Connect a wallet before claiming a username.</p> : null}
      {isConnected && !onBase ? <p className="feedback neutral">Switch your wallet network to Base before claiming.</p> : null}
      {userOwnsName ? (
        <p className="feedback neutral">
          This wallet already holds <strong>@{ownedName}</strong>. The current contract keeps a single visible username record for the address.
        </p>
      ) : null}
    </div>
  );
}
