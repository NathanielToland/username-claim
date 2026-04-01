import { Attribution } from "ox/erc8021";
import { createConfig, http, injected } from "wagmi";
import { base } from "wagmi/chains";
import { BUILDER_CODE, BUILDER_DATA_SUFFIX } from "@/lib/app-config";

const generatedDataSuffix = Attribution.toDataSuffix({
  codes: [BUILDER_CODE],
});

export const builderDataSuffix = BUILDER_DATA_SUFFIX;

if (process.env.NODE_ENV !== "production" && generatedDataSuffix !== BUILDER_DATA_SUFFIX) {
  console.warn("Builder code suffix mismatch detected. Keeping the provided Base.dev suffix.");
}

export const wagmiConfig = createConfig({
  chains: [base],
  multiInjectedProviderDiscovery: false,
  connectors: [injected()],
  ssr: true,
  transports: {
    [base.id]: http("https://mainnet.base.org"),
  },
  dataSuffix: builderDataSuffix,
});

// Builder code attribution is enabled via the Base dataSuffix capability.
// Replace BUILDER_CODE and BUILDER_DATA_SUFFIX only when Base.dev issues a new pair.
