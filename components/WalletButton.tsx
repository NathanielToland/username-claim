"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { shortenAddress } from "@/lib/format";

export function WalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, error, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const okxConnector = connectors.find((item) => item.name.toLowerCase().includes("okx"));
  const injectedConnector = connectors.find((item) => item.type === "injected");
  const connector = okxConnector ?? injectedConnector ?? connectors[0];

  if (isConnected) {
    return (
      <button type="button" className="wallet-button connected" onClick={() => disconnect()}>
        <span className="status-dot" />
        {shortenAddress(address)}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="wallet-button"
      onClick={() => connector && connect({ connector })}
      disabled={!connector || isPending}
      title={error instanceof Error ? error.message : undefined}
    >
      {isPending ? "Connecting..." : okxConnector ? "Connect OKX Wallet" : "Connect Wallet"}
    </button>
  );
}
