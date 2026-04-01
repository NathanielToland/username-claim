import { http, createConfig } from "wagmi";
import { base } from "wagmi/chains";
import { injected } from "wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [base],
  connectors: [injected()],
  ssr: true,
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
});

// TODO(builder-code): append the official builder code data suffix to the Base RPC or
// transport configuration when it is provided for this app. Replace this placeholder with
// the final builder code string so Base attribution, analytics, and app identity are preserved.
