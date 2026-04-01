"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useSwitchChain,
  useWaitForTransactionReceipt,
  useWalletClient,
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
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient({ chainId: base.id });
  const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain();
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

  const ownedName = (ownedNameQuery.data as string | undefined) ?? "";
  const userOwnsName = ownedName.length > 0;

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

  const runCheck = async () => {
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

    setActionMessage("Checking live registry status...");
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
    setActionMessage("Claim state reset. You can check and submit again.");
  };

  const runClaim = async () => {
    if (!isConnected) {
      setActionMessage("Connect a wallet before submitting a claim.");
      return;
    }

    if (!onBase) {
      setActionMessage("Switching your wallet to Base. After it completes, press Claim Username again.");
      try {
        await switchChainAsync({ chainId: base.id });
      } catch (switchError) {
        setActionMessage(switchError instanceof Error ? switchError.message : "Switch to Base and try again.");
      }
      return;
    }

    if (!walletClient || !walletClient.account) {
      setActionMessage("Wallet client is not ready. Reconnect the wallet and try again.");
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
      const hash = await walletClient.writeContract({
        account: walletClient.account,
        chain: base,
        abi: usernameAbi,
        address: CONTRACT_ADDRESS,
        functionName: "claim",
        args: [normalizedInput],
      });
      setActiveHash(hash);
      setActionMessage("Transaction submitted. Waiting for Base confirmation...");
    } catch (claimError) {
      setIsSubmittingClaim(false);
      setActionMessage(claimError instanceof Error ? claimError.message : "Unable to open the claim request.");
    }
  };

  const canClaim = isConnected && handleIsValid && !userOwnsName && !isSubmittingClaim && !receipt.isPending && !isSwitchingChain;

  return (
    <div className="claim-workspace">
      <UsernameClaimInput value={input} onChange={setInput} onCheck={() => void runCheck()} disabled={availability.status === "checking"} />

      <AvailabilityIndicator status={availability.status === "error" ? "invalid" : availability.status} detail={availability.detail} />

      <ActionBar>
        <ClaimUsernameButton busy={isSubmittingClaim || receipt.isPending || isSwitchingChain} disabled={!canClaim} onClick={() => void runClaim()} />
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
