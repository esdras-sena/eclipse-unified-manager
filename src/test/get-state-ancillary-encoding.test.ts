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
    const ancillaryDataHex =
      "0x57696c6c20457364726173206465706c6f792045636c69707365204f7261636c6520746f20537461726b6e6574206d61696e6e657420756e74696c20686973206269727468646179206174204d617263682031303f";

    const provider = new RpcProvider({ nodeUrl: getNodeUrl() });
    const contract = new Contract({
      abi: ooAbi as any,
      address: contractAddress,
      providerOrAccount: provider,
    });

    // Encoding candidates:
    // - Raw UTF-8 string (starknet.js will convert to CairoByteArray internally)
    // - Hex bytes string (Voyager-style; starknet.js detects 0x.. and uses those bytes)
    const [stateFromString, stateFromHex] = await Promise.all([
      contract.callStatic.get_state(requester, identifier, timestamp, ancillaryDataString),
      contract.callStatic.get_state(requester, identifier, timestamp, ancillaryDataHex),
    ]);

    const v1 = extractEnumVariant(stateFromString);
    const v2 = extractEnumVariant(stateFromHex);

    console.log("get_state variant (from string):", v1);
    console.log("get_state variant (from hex):", v2);

    // Both forms MUST resolve to the same on-chain request key
    expect(v1).toBe(v2);

    // Requested == 1 in the contract's enum ordering.
    // If this fails, it means the request is not in Requested state OR the encoding doesn't match.
    expect(v1).toBe("Requested");
  }, 30_000);
});
