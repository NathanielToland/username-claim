"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortenAddress } from "@/lib/format";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected) {
    return (
      <button className="wallet-button connected" onClick={() => disconnect()}>
        <span className="status-dot" />
        {shortenAddress(address)}
      </button>
    );
  }

  return (
    <button
      className="wallet-button"
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
