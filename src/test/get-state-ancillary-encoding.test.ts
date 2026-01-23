import { describe, expect, it } from "vitest";
import { Contract, RpcProvider } from "starknet";

import ooAbi from "@/web3/abis/ooAbi.json";
import { getNodeUrl } from "@/web3/utils/network";

function extractEnumVariant(value: unknown): string {
  if (!value) return "";

  // starknet.js CairoCustomEnum
  if (typeof value === "object" && typeof (value as any).activeVariant === "function") {
    try {
      return String((value as any).activeVariant());
    } catch {
      // fall through
    }
  }

  // sometimes decoded enums come as { VariantName: ... }
  if (typeof value === "object") {
    const keys = Object.keys(value as any);
    if (keys.length === 1) return keys[0];
  }

  return String(value);
}

// Same helper as useProposePrice
function utf8ToHex(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let hex = '0x';
  for (const b of bytes) hex += b.toString(16).padStart(2, '0');
  return hex;
}

// Same as useProposePrice
function toI256(value: bigint) {
  const signal = value >= 0n ? 0 : 1;
  const magnitude = value >= 0n ? value : -value;
  const low = magnitude & ((1n << 128n) - 1n);
  const high = magnitude >> 128n;

  return {
    signal,
    value: {
      low: low.toString(),
      high: high.toString(),
    },
  };
}

describe("get_state ancillaryData encoding (debug)", () => {
  it("should return Requested when ancillaryData is encoded correctly", async () => {
    // Values taken from the failing propose attempt logs
    const contractAddress =
      "0x730c29a5f1e6cc39c19800b952bf43b7d530570db71a1ce5b3d99c059d68c81";
    const requester =
      "0x6d3437f16c6560e0a89cc14663a6d5475939ab0ef61850bc5d41f4681fccb70";
    const identifier = "0x5945535f4f525f4e4f5f5155455259"; // YES_OR_NO_QUERY
    const timestamp = 1769179432;
    const ancillaryDataString =
      "Will Esdras deploy Eclipse Oracle to Starknet mainnet until his birthday at March 10?";

    const provider = new RpcProvider({ nodeUrl: getNodeUrl() });
    const contract = new Contract({
      abi: ooAbi as any,
      address: contractAddress,
      providerOrAccount: provider,
    });

    // Build hex exactly like useProposePrice does
    const ancillaryDataHex = utf8ToHex(ancillaryDataString);
    
    console.log("ancillaryDataString:", ancillaryDataString);
    console.log("ancillaryDataHex:", ancillaryDataHex);

    // Test get_state using the SAME encoding as useProposePrice
    const state = await contract.call("get_state", [
      requester,
      identifier,
      timestamp,
      ancillaryDataHex,
    ]);
    console.log("get_state result:", state);

    const variant = extractEnumVariant(state);
    console.log("get_state variant:", variant);

    expect(variant).toBe("Requested");
  }, 30_000);

  it("should successfully populate propose_price transaction", async () => {
    // Same values as above
    const contractAddress =
      "0x730c29a5f1e6cc39c19800b952bf43b7d530570db71a1ce5b3d99c059d68c81";
    const requester =
      "0x6d3437f16c6560e0a89cc14663a6d5475939ab0ef61850bc5d41f4681fccb70";
    const identifier = "0x5945535f4f525f4e4f5f5155455259";
    const timestamp = 1769179432;
    const ancillaryDataString =
      "Will Esdras deploy Eclipse Oracle to Starknet mainnet until his birthday at March 10?";
    const proposedPrice = BigInt("1000000000000000000"); // 1e18 = YES

    const provider = new RpcProvider({ nodeUrl: getNodeUrl() });
    const contract = new Contract({
      abi: ooAbi as any,
      address: contractAddress,
      providerOrAccount: provider,
    });

    // EXACT same encoding as useProposePrice
    const ancillaryDataHex = utf8ToHex(ancillaryDataString);
    const proposedPriceI256 = toI256(proposedPrice);

    console.log("=== propose_price params (test) ===");
    console.log("requester:", requester);
    console.log("identifier:", identifier);
    console.log("timestamp:", timestamp);
    console.log("ancillaryDataHex:", ancillaryDataHex);
    console.log("proposedPriceI256:", proposedPriceI256);

    // Use populateTransaction EXACTLY like useProposePrice does
    const call = contract.populateTransaction.propose_price(
      requester,
      identifier,
      timestamp,
      ancillaryDataHex,
      proposedPriceI256
    );

    console.log("=== populated call ===");
    console.log(JSON.stringify(call, null, 2));

    // The call should be populated without errors
    expect(call).toBeDefined();
    expect(call.contractAddress).toBe(contractAddress);
    expect(call.entrypoint).toBe("propose_price");
  }, 30_000);
});
