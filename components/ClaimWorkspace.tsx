"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAccount, usePublicClient, useReadContract, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from "wagmi";
import { base } from "wagmi/chains";
import { encodeFunctionData, type Address } from "viem";
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

type AvailabilityState = {
  status: "idle" | "checking" | "available" | "taken" | "claimed" | "invalid" | "error";
  detail: string;
  owner?: string;
  handle?: string;
};

export function ClaimWorkspace({ initialHandle = "" }: Props) {
  const [input, setInput] = useState(initialHandle);
  const [checkedHandle, setCheckedHandle] = useState(normalizeHandle(initialHandle));
  const [actionMessage, setActionMessage] = useState("");
  const [activeHash, setActiveHash] = useState<`0x${string}` | undefined>();
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "idle",
    detail: "Search the registry to confirm whether a handle can be claimed.",
  });

  const { address, chainId, isConnected } = useAccount();
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
  const { writeContractAsync, isPending: isWriting, error: writeError, reset: resetWrite } = useWriteContract();
  const publicClient = usePublicClient({ chainId: base.id });
  const normalizedInput = useMemo(() => normalizeHandle(input), [input]);
  const handleIsValid = isHandleValid(normalizedInput);
  const onBase = chainId === base.id;

  const ownedNameQuery = useReadContract({
    abi: usernameAbi,
    address: CONTRACT_ADDRESS,
    functionName: "nameOfUser",
    args: address ? [address] : undefined,
    query: {
      enabled: Boolean(address),
    },
  });

  const receipt = useWaitForTransactionReceipt({
    hash: activeHash,
    query: {
      enabled: Boolean(activeHash),
    },
  });

  useEffect(() => {
    if (receipt.isSuccess && activeHash && address) {
      setIsSubmittingClaim(false);
      setActionMessage("Claim confirmed and registry data refreshed.");
      setAvailability({
        status: "claimed",
        detail: "Claim confirmed. The registry record is now assigned.",
        owner: address,
        handle: checkedHandle || normalizedInput,
      });
      trackTransaction(APP_ID, APP_NAME_LABEL, address, activeHash);
      void ownedNameQuery.refetch();
    }
  }, [activeHash, address, checkedHandle, normalizedInput, ownedNameQuery, receipt.isSuccess]);

  useEffect(() => {
    if (receipt.isError) {
      setIsSubmittingClaim(false);
      setActionMessage("This transaction did not confirm on Base. Reset the claim state and try again.");
    }
  }, [receipt.isError]);

  useEffect(() => {
    if (writeError) {
      setIsSubmittingClaim(false);
      setActionMessage(writeError.message || "Unable to open the claim request.");
      if (typeof window !== "undefined") {
        window.open("https://walletconnect.com", "_blank", "noopener,noreferrer");
      }
    }
  }, [writeError]);

  useEffect(() => {
    if (!normalizedInput) {
      setAvailability({
        status: "idle",
        detail: "Search the registry to confirm whether a handle can be claimed.",
      });
      return;
    }

    if (!handleIsValid) {
      setAvailability({
        status: "invalid",
        detail: "Use 2 to 20 characters with letters, numbers, dots, or hyphens.",
        handle: normalizedInput,
      });
    }
  }, [handleIsValid, normalizedInput]);

  const ownedName = (ownedNameQuery.data as string | undefined) ?? "";
  const userOwnsName = ownedName.length > 0;

  const clearStaleClaimState = (message?: string) => {
    if (activeHash || isSubmittingClaim || receipt.isPending || receipt.isError || isWriting) {
      setActiveHash(undefined);
      setIsSubmittingClaim(false);
      resetWrite();
      if (message) setActionMessage(message);
    }
  };

  const runCheck = async () => {
    clearStaleClaimState("Checking live registry status...");

    if (!normalizedInput) {
      setActionMessage("Enter a username before checking availability.");
      return;
    }

    if (!handleIsValid) {
      setActionMessage("Use 2 to 20 characters with letters, numbers, dots, or hyphens.");
      setAvailability({
        status: "invalid",
        detail: "Use 2 to 20 characters with letters, numbers, dots, or hyphens.",
        handle: normalizedInput,
      });
      return;
    }

    if (!publicClient) {
      setActionMessage("Base public client is not ready. Refresh and try again.");
      setAvailability({
        status: "error",
        detail: "Base RPC is not ready yet. Refresh and try again.",
        handle: normalizedInput,
      });
      return;
    }

    setCheckedHandle(normalizedInput);
    setAvailability({
      status: "checking",
      detail: "Registry lookup in progress.",
      handle: normalizedInput,
    });

    try {
      const owner = (await publicClient.readContract({
        abi: usernameAbi,
        address: CONTRACT_ADDRESS,
        functionName: "ownerOfName",
        args: [normalizedInput],
      })) as string;

      if (owner && owner !== zeroAddress) {
        setAvailability({
          status: "taken",
          detail: `This handle is already held by ${shortenAddress(owner)}.`,
          owner,
          handle: normalizedInput,
        });
        setActionMessage("This handle is already taken.");
      } else {
        setAvailability({
          status: "available",
          detail: "This handle is open for claim on Base.",
          handle: normalizedInput,
        });
        setActionMessage("Availability confirmed. You can submit the claim now.");
      }
    } catch (checkError) {
      setAvailability({
        status: "error",
        detail: "Unable to read the Base registry right now. Try again.",
        handle: normalizedInput,
      });
      setActionMessage(checkError instanceof Error ? checkError.message : "Unable to read the Base registry right now.");
    }
  };

  const resetTransactionState = () => {
    setActiveHash(undefined);
    setIsSubmittingClaim(false);
    resetWrite();
    setActionMessage("Claim state reset. You can check and submit again.");
  };

  const claimViaWriteContract = async () => {
    if (!address) {
      throw new Error("Wallet address is unavailable.");
    }

    const data = encodeFunctionData({
      abi: usernameAbi,
      functionName: "claim",
      args: [normalizedInput],
    });

    console.log("[claim] writeContractAsync called", {
      chainId: base.id,
      address,
      handle: normalizedInput,
    });

    const hash = await writeContractAsync({
      abi: usernameAbi,
      address: CONTRACT_ADDRESS,
      functionName: "claim",
      args: [normalizedInput],
      chainId: base.id,
    });

    console.log("[claim] writeContractAsync returned", { hash, data });
    return hash;
  };

  const runClaim = async () => {
    console.log("[claim] click event fired", {
      isConnected,
      onBase,
      normalizedInput,
      availability: availability.status,
    });

    if (!isConnected) {
      setActionMessage("Connect a wallet before submitting a claim.");
      return;
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

    if (availability.handle !== normalizedInput || availability.status === "idle" || availability.status === "checking") {
      await runCheck();
      return;
    }

    if (availability.status !== "available") {
      setActionMessage(availability.detail);
      return;
    }

    setIsSubmittingClaim(true);
    setActionMessage("Opening wallet confirmation...");

    try {
      console.log("[claim] preparing claim transaction");

      if (!onBase) {
        console.log("[claim] switching chain to Base");
        await switchChainAsync({ chainId: base.id });
      }

      console.log("[claim] calling writeContractAsync now");
      const hash = await claimViaWriteContract();
      setActiveHash(hash);
      setActionMessage("Transaction submitted. Waiting for Base confirmation...");
    } catch (claimError) {
      console.log("[claim] transaction failed", claimError);
      setIsSubmittingClaim(false);
      resetWrite();
      setActionMessage(claimError instanceof Error ? claimError.message : "Unable to open the claim request.");
      if (typeof window !== "undefined") {
        window.open("https://walletconnect.com", "_blank", "noopener,noreferrer");
      }
    }
  };

  const canClaim = isConnected && handleIsValid && !userOwnsName && !isSubmittingClaim && !receipt.isPending && !isWriting && !isSwitchingChain;
  const handleInputChange = (value: string) => {
    if (activeHash || isSubmittingClaim || receipt.isPending || receipt.isError) {
      setActiveHash(undefined);
      setIsSubmittingClaim(false);
      resetWrite();
    }
    setInput(value);
  };

  return (
    <div className="claim-workspace">
      <UsernameClaimInput value={input} onChange={handleInputChange} onCheck={() => void runCheck()} disabled={availability.status === "checking"} />

      <AvailabilityIndicator status={availability.status === "error" ? "invalid" : availability.status} detail={availability.detail} />

      <ActionBar>
        <ClaimUsernameButton busy={isSubmittingClaim || receipt.isPending || isWriting || isSwitchingChain} disabled={!canClaim} onClick={() => void runClaim()} />
        <Link className="ghost-link" href={normalizedInput ? `/usernames/${normalizedInput}` : "/registry"}>
          View Detail
        </Link>
        {activeHash ? (
          <a className="ghost-link" href={`https://basescan.org/tx/${activeHash}`} target="_blank" rel="noreferrer">
            Open Transaction
          </a>
        ) : null}
        {(activeHash || receipt.isError || isSubmittingClaim) ? (
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
          detail={availability.handle === normalizedInput ? availability.detail : "No registry lookup submitted yet."}
          accent={<UsernameStatusChip status={availability.status === "error" ? "invalid" : availability.status === "idle" ? "status" : availability.status} />}
        />
      </div>

      {actionMessage ? <p className="feedback neutral">{actionMessage}</p> : null}
      {receipt.isPending && activeHash ? (
        <p className="feedback neutral">
          Pending transaction: <span>{activeHash}</span>
        </p>
      ) : null}
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