"use client";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  alchemyProvider,
  jsonRpcProvider,
  infuraProvider,
  lavaProvider,
  blastProvider,
  cartridgeProvider,
  StarknetConfig,
  starkscan,
} from "@starknet-react/core";

import { InjectedConnector } from "starknetkit/injected";
import { ArgentMobileConnector } from "starknetkit/argentMobile";
import { WebWalletConnector } from "starknetkit/webwallet";

export function StarknetProvider({ children }) {
  const connectors = [
    new InjectedConnector({ options: { id: "argentX", name: "Argent" } }),
    new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
    new WebWalletConnector({ url: "https://web.argent.xyz" }),
    new ArgentMobileConnector(),
  ];
  const apiKey = import.meta.env.VITE_API_KEY;
  const nodeProvider = import.meta.env.VITE_PROVIDER;
  const explicitRpcUrl = import.meta.env.VITE_RPC_URL;
  const envSepolia = import.meta.env.VITE_SEPOLIA_RPC_URL;
  const envMainnet = import.meta.env.VITE_MAINNET_RPC_URL;

  let provider;
  // If per‑chain env URLs are provided, honor them and keep provider dynamic by chain
  if (envSepolia || envMainnet) {
    const fallbackMain = "https://rpc.starknet.lava.build:443";
    const fallbackSep = "https://rpc.starknet-testnet.lava.build:443";
    provider = jsonRpcProvider({
      rpc: (chain) => {
        const isMain = chain.id === mainnet.id;
        const nodeUrl = isMain
          ? envMainnet || fallbackMain
          : envSepolia || fallbackSep;
        return { nodeUrl };
      },
    });
  } else if (explicitRpcUrl) {
    // Legacy single-URL override (not chain-aware)
    provider = jsonRpcProvider({ rpc: () => ({ nodeUrl: explicitRpcUrl }) });
  } else if (nodeProvider == "infura" && apiKey) {
    provider = infuraProvider({ apiKey });
  } else if (nodeProvider == "alchemy" && apiKey) {
    provider = alchemyProvider({ apiKey });
  } else if (nodeProvider == "lava" && apiKey) {
    provider = lavaProvider({ apiKey });
  } else if (nodeProvider == "blast" && apiKey) {
    provider = blastProvider({ apiKey });
  } else if (nodeProvider == "reddio" && apiKey) {
    provider = cartridgeProvider({ apiKey });
  } else {
    // Default to Blast public RPC (non-random) per chain
    provider = jsonRpcProvider({
      rpc: (chain) => {
        const isMainnet = chain.id === mainnet.id;
        const nodeUrl = isMainnet
          ? "https://rpc.starknet.lava.build:443"
          : "https://rpc.starknet-testnet.lava.build:443";
        return { nodeUrl };
      },
    });
  }

  let lsHint = "";
  if (typeof window !== "undefined") {
    try {
      lsHint = (localStorage.getItem("preferredChain") || "").toLowerCase();
    } catch {}
  }
  const chainHint = (
    lsHint ||
    import.meta.env.VITE_CHAIN ||
    ""
  ).toLowerCase();
  const defaultChainId = chainHint.includes("main") ? mainnet.id : sepolia.id;
  // const provider = new RpcProvider({ nodeUrl: 'https://free-rpc.nethermind.io/sepolia-juno/v0_7' });
  return (
    <StarknetConfig
      connectors={connectors}
      chains={[mainnet, sepolia]}
      provider={provider}
      explorer={starkscan}
      autoConnect={true}
      defaultChainId={defaultChainId}
    >
      {children}
    </StarknetConfig>
  );
}