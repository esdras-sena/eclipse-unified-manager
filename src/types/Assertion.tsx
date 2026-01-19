
export type EscalationManagerSettings = {
  arbitrateViaEscalationManager: boolean; // True if escalation manager should arbitrate disputes.
  discardOracle: boolean; // True if oracle result should be discarded.
  validateDisputers: boolean; // True if disputers need to be validated by escalation manager.
};

export type Assertion = {
  txHash: string;
  assertionId: string; // Unique identifier for the assertion (bytes32 hash of parameters).
  claim: string; // The encoded claim being asserted.
  asserter: string; // Address of the account that made the assertion.
  disputer: string; // Address of the disputer (0x0 if not disputed).
  callbackRecipient: string; // Address to receive callbacks on assertion resolution.
  escalationManager: string; // Address of the escalation manager (0x0 for default DVM).
  currency: string; // ERC20 token address used for bond.
  bond: bigint; // Bond amount required for the assertion.
  identifier: string; // Identifier for DVM (bytes32).
  domainId: string; // Optional parameter to group assertions.
  liveness: number; // Time window (seconds) during which assertion can be disputed.
  assertionTime: number; // Timestamp when the assertion was made.
  expirationTime: number; // Time at which the assertion expires if not disputed.
  settled: boolean; // True if the assertion has been settled.
  settlementResolution: boolean; // Resolution of the assertion (true if asserter was correct).
  escalationManagerSettings: EscalationManagerSettings;
};
