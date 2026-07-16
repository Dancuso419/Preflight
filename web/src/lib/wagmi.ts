import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: { name: "MON", symbol: "MON", decimals: 18 },
  rpcUrls: { default: { http: [import.meta.env.VITE_MONAD_RPC_TESTNET ?? "https://testnet-rpc.monad.xyz"] } },
  blockExplorers: { default: { name: "MonadScan", url: "https://testnet.monadexplorer.com" } },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: "PreFlight",
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? "preflightdemo",
  chains: [monadTestnet],
  ssr: false,
});
