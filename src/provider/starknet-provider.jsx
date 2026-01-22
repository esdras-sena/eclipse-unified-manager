"use client";
import React from "react";
import { sepolia, mainnet } from "@starknet-react/chains";
import {
  jsonRpcProvider,
  StarknetConfig,
  starkscan,
  argent,
  braavos,
} from "@starknet-react/core";
import { WebWalletConnector } from "starknetkit/webwallet";

// Create connectors once at module level - these are factory functions, not hooks
// WebWalletConnector = Ready (Email) connector for passwordless login
const webWalletConnector = new WebWalletConnector({ url: "https://web.argent.xyz" });
const connectors = [webWalletConnector, argent(), braavos()];

// Provider configuration - pure function, safe at module level
const provider = jsonRpcProvider({
  rpc: (chain) => {
    const envSepolia = import.meta.env.VITE_SEPOLIA_RPC_URL;
    const envMainnet = import.meta.env.VITE_MAINNET_RPC_URL;
    const explicitRpcUrl = import.meta.env.VITE_RPC_URL;
    
    const fallbackMain = "https://rpc.starknet.lava.build:443";
    const fallbackSep = "https://rpc.starknet-testnet.lava.build:443";
    
    if (explicitRpcUrl) {
      return { nodeUrl: explicitRpcUrl };
    }
    
    const isMain = chain.id === mainnet.id;
    const nodeUrl = isMain
      ? envMainnet || fallbackMain
      : envSepolia || fallbackSep;
    return { nodeUrl };
  },
});

// Determine default chain from environment or localStorage
function getDefaultChainId() {
  let lsHint = "";
  if (typeof window !== "undefined") {
    try {
      lsHint = (localStorage.getItem("preferredChain") || "").toLowerCase();
    } catch {}
  }
  const chainHint = (lsHint || import.meta.env.VITE_CHAIN || "").toLowerCase();
  return chainHint.includes("main") ? mainnet.id : sepolia.id;
}

const defaultChainId = getDefaultChainId();

export function StarknetProvider({ children }) {
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
