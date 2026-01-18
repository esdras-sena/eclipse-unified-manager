
export type RequestSettings = {
    eventBased: boolean, // True if the request is set to be event-based.
    refundOnDispute: boolean, // True if the requester should be refunded their reward on dispute.
    callbackOnPriceProposed: boolean, // True if callbackOnPriceProposed callback is required.
    callbackOnPriceDisputed: boolean, // True if callbackOnPriceDisputed callback is required.
    callbackOnPriceSettled: boolean, // True if callbackOnPriceSettled callback is required.
    bond: bigint, // Bond that the proposer and disputer must pay on top of the final fee.
    customLiveness: bigint // Custom liveness value set by the requester.
}

export type Request =  {
    txHash: string,
    requestId: string,
    proposer: string, // Address of the proposer.
    disputer: string, // Address of the disputer.
    currency: string, // ERC20 token used to pay rewards and fees.
    settled: boolean, // True if the request is settled.
    requestSettings: RequestSettings, // Custom settings associated with a request.
    proposedPrice: bigint, // Price that the proposer submitted.
    resolvedPrice: bigint, // Price resolved once the request is settled.
    expirationTime: number, // Time at which the request auto-settles without a dispute.
    reward: bigint, // Amount of the currency to pay to the proposer on settlement.
    finalFee: bigint // Final fee to pay to the Store upon request to the DVM.
}

