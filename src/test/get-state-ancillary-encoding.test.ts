import { describe, expect, it } from "vitest";
import { Contract, RpcProvider, byteArray } from "starknet";

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

    // Build ByteArray exactly like useProposePrice does
    const ancillaryDataHex = utf8ToHex(ancillaryDataString);
    
    // Also try using starknet.js byteArray helper for comparison
    const ancillaryByteArray = byteArray.byteArrayFromString(ancillaryDataString);

    console.log("ancillaryDataHex:", ancillaryDataHex);
    console.log("ancillaryByteArray:", ancillaryByteArray);

    // Test with hex string (same as useProposePrice)
    const stateFromHex = await contract.call("get_state", [
      requester,
      identifier,
      timestamp,
      ancillaryDataHex,
    ]);

    // Test with byteArray struct
    const stateFromByteArray = await contract.call("get_state", [
      requester,
      identifier,
      timestamp,
      ancillaryByteArray,
    ]);

    const v1 = extractEnumVariant(stateFromHex);
    const v2 = extractEnumVariant(stateFromByteArray);

    console.log("get_state variant (from hex):", v1);
    console.log("get_state variant (from byteArray):", v2);

    // Both forms MUST resolve to the same on-chain request key
    expect(v1).toBe(v2);

    // Requested == 1 in the contract's enum ordering.
    // If this fails, it means the request is not in Requested state OR the encoding doesn't match.
    expect(v1).toBe("Requested");
  }, 30_000);
});
