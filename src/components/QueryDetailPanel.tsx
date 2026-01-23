import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { X, Info, Clock, FileText, ExternalLink, CheckCircle, AlertTriangle, ChevronDown, Send, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CopyButton from "./lib/CopyButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProposePrice } from "@/web3/hooks/useProposePrice";
import { useAccount } from "@starknet-react/core";
import { toast } from "sonner";

export type OracleType = "optimistic-oracle" | "optimistic-oracle-managed" | "optimistic-oracle-asserter";

interface QueryDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  query: {
    id: string;
    title: string;
    subtitle: string;
    proposal: string;
    bond: string;
    bondToken?: string;
    status: "active" | "ended" | "disputed";
    timeLeft?: string;
    // Extended data for detail view
    description?: string;
    eventBased?: boolean;
    oracleType?: OracleType;
    // Timestamp data
    requestedTime?: string;
    requestedTimeUnix?: string;
    proposedTime?: string;
    proposedTimeUnix?: string;
    settledTime?: string;
    settledTimeUnix?: string;
    // Request-type specific fields (Optimistic Oracle, OO Managed)
    identifier?: string;
    identifierRaw?: string; // Raw felt252 hex for contract calls
    requester?: string;
    requesterTxHash?: string;
    proposer?: string;
    proposerTxHash?: string;
    // Assertion-type specific fields (Optimistic Oracle Asserter)
    asserter?: string;
    asserterTxHash?: string;
    caller?: string;
    escalationManager?: string;
    callbackRecipient?: string;
    // Common fields
    transactionHash?: string;
    oracleAddress?: string;
    reward?: string;
  } | null;
  type: "verify" | "propose" | "settled";
}

const QueryDetailPanel = ({ isOpen, onClose, query, type }: QueryDetailPanelProps) => {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const { address } = useAccount();
  const { proposePrice, isPending, error: proposeError } = useProposePrice();
  
  // Lock body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
    } else {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.touchAction = '';
    };
  }, [isOpen]);
  
  if (!isOpen || !query) return null;

  const getStatusColor = () => {
    if (type === "settled") return "text-green-500";
    if (query.status === "disputed") return "text-red-400";
    return "text-primary";
  };

  const getStatusLabel = () => {
    if (type === "settled") return "Settled as";
    if (type === "propose") return "Propose Answer";
    return "Dispute Proposal?";
  };

  const getOracleTypeLabel = () => {
    switch (query.oracleType) {
      case "optimistic-oracle":
        return "Optimistic Oracle";
      case "optimistic-oracle-managed":
        return "Optimistic Oracle Managed";
      case "optimistic-oracle-asserter":
        return "Optimistic Oracle Asserter";
      default:
        return "Optimistic Oracle";
    }
  };

  const isAsserterType = query.oracleType === "optimistic-oracle-asserter";

  // Convert selected answer to bigint value for propose_price
  const getProposedPriceValue = (answer: string): bigint => {
    // YES_OR_NO_QUERY: true = 1e18, false = 0, indeterminate = 0.5e18
    switch (answer) {
      case "true":
        return BigInt("1000000000000000000"); // 1e18
      case "false":
        return BigInt(0);
      case "0.5":
        return BigInt("500000000000000000"); // 0.5e18
      default:
        return BigInt(0);
    }
  };

  const handleProposeAnswer = async () => {
    if (!query || !selectedAnswer) return;
    
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!query.requester || !query.identifierRaw || !query.requestedTimeUnix) {
      toast.error("Missing required query data for proposal");
      console.error("Missing data:", { requester: query.requester, identifierRaw: query.identifierRaw, requestedTimeUnix: query.requestedTimeUnix });
      return;
    }

    // Only support OO and OO Managed for proposals
    if (query.oracleType === "optimistic-oracle-asserter") {
      toast.error("Asserter oracle type uses assertions, not proposals");
      return;
    }

    const proposedPrice = getProposedPriceValue(selectedAnswer);
    
    const txHash = await proposePrice({
      oracleType: query.oracleType || "optimistic-oracle",
      requester: query.requester,
      identifierRaw: query.identifierRaw,
      timestamp: query.requestedTimeUnix,
      ancillaryData: query.title, // The ancillary data is the query title
      proposedPrice,
    });

    if (txHash) {
      toast.success("Proposal submitted successfully!");
      onClose();
      // Navigate to Verify page after successful proposal
      navigate("/");
    } else if (proposeError) {
      toast.error(`Proposal failed: ${proposeError.message}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto overflow-x-hidden animate-slide-in-right touch-none">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b border-border p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <span className="text-xs text-muted-foreground">○○</span>
              </div>
              <h2 className="text-sm font-medium text-foreground leading-tight">
                {query.title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition-colors flex-shrink-0"
            >
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Status Section */}
          <div className="space-y-3">
            <div className={`flex items-center gap-2 ${getStatusColor()}`}>
              {type === "settled" ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-current" />
                </div>
              )}
              <span className="text-sm font-medium">{getStatusLabel()}</span>
            </div>

            {/* Proposal Display for verify/settled OR Answer Selection for propose */}
            {type === "propose" ? (
              <div className="space-y-3">
                <Select value={selectedAnswer} onValueChange={setSelectedAnswer}>
                  <SelectTrigger className="w-full bg-card border-border">
                    <SelectValue placeholder="Select your answer" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border z-50">
                    <SelectItem value="true">True (Yes)</SelectItem>
                    <SelectItem value="false">False (No)</SelectItem>
                    <SelectItem value="0.5">Indeterminate (0.5)</SelectItem>
                  </SelectContent>
                </Select>

                {/* Propose Button */}
                <button
                  disabled={!selectedAnswer || isPending || !address}
                  className={`w-full py-3 px-4 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    selectedAnswer && !isPending && address
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                      : "bg-muted text-muted-foreground cursor-not-allowed"
                  }`}
                  onClick={handleProposeAnswer}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Proposing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      {address ? "Propose Answer" : "Connect Wallet to Propose"}
                    </>
                  )}
                </button>

                {/* Bond Notice */}
                <p className="text-xs text-muted-foreground text-center">
                  You need to post a bond of {query.bond} {query.bondToken || "USDC"} to propose
                </p>
              </div>
            ) : (
              <div className="bg-muted/50 rounded-lg p-3 border border-border">
                <span className="text-sm text-foreground">
                  Proposal: {query.proposal}
                </span>
              </div>
            )}
          </div>

          {/* Bond & Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">Bond</span>
                <Info className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">USDC</span>
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">$</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {query.bond} {query.bondToken}
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">Reward</span>
                <Info className="h-3 w-3" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">USDC</span>
                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">$</span>
                </div>
                <span className="text-sm font-medium text-foreground">
                  {query.reward || "5"}
                </span>
              </div>
            </div>
          </div>

          {/* Challenge Period */}
          {type === "verify" && (
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="text-xs">Challenge period ends</span>
                <Info className="h-3 w-3" />
              </div>
              <span className="text-sm text-foreground">
                {query.status === "active" && query.timeLeft
                  ? `In ${query.timeLeft}`
                  : query.status === "ended"
                  ? "Ended"
                  : "Disputed"}
              </span>
            </div>
          )}

          {/* Dispute Action - Only show when challenge period is active */}
          {type === "verify" && query.status === "active" && (
            <div className="space-y-4 pt-2">
              {/* Dispute Warning */}
              <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-400">
                  If this proposal is incorrect, you can dispute it by posting a bond of{" "}
                  <span className="font-semibold">{query.bond} {query.bondToken || "USDC"}</span>.
                  If your dispute is successful, you'll receive the proposer's bond as a reward.
                </p>
              </div>

              {/* Dispute Button */}
              <button
                className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                onClick={() => {
                  // TODO: Connect wallet and dispute logic
                  console.log("Dispute proposal:", query.id);
                }}
              >
                <AlertTriangle className="h-4 w-4" />
                Dispute Proposal
              </button>

              {/* Balance Notice */}
              <p className="text-xs text-muted-foreground text-center">
                You need at least {query.bond} {query.bondToken || "USDC"} to dispute this proposal
              </p>
            </div>
          )}

          {/* Info Notice */}
          {type === "verify" && query.status === "ended" && (
            <div className="flex items-start gap-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <Info className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-400">
                This query has already been settled.{" "}
                <a href="#" className="underline hover:text-blue-300">
                  View it here
                </a>
                .
              </p>
            </div>
          )}

          {/* Oracle Type & Event Based */}
          <div className="flex items-center gap-2 py-3 border-t border-border flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">○○</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {getOracleTypeLabel()}
              </span>
            </div>
            {query.eventBased && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full border border-primary/30">
                <span className="text-xs text-primary font-medium">Event Based</span>
              </div>
            )}
          </div>

          {/* Timestamp Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Timestamp</span>
            </div>

            {/* Requested Time */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground font-medium">Requested Time</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">UTC</span>
                <span className="text-sm text-foreground">
                  {query.requestedTime || query.subtitle}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">UNIX</span>
                <span className="text-sm text-foreground">
                  {query.requestedTimeUnix || "-"}
                </span>
              </div>
            </div>

            {/* Proposed Time */}
            {(type === "verify" || type === "settled") && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Proposed Time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UTC</span>
                  <span className="text-sm text-foreground">
                    {query.proposedTime || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UNIX</span>
                  <span className="text-sm text-foreground">
                    {query.proposedTimeUnix || "-"}
                  </span>
                </div>
              </div>
            )}

            {/* Settled Time */}
            {type === "settled" && (
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground font-medium">Settled Time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UTC</span>
                  <span className="text-sm text-foreground">
                    {query.settledTime || "-"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UNIX</span>
                  <span className="text-sm text-foreground">
                    {query.settledTimeUnix || "-"}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Additional Text Data */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Additional Text Data</span>
            </div>

            <div className="space-y-4">
              {query.description && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Description</span>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {query.description}
                  </p>
                </div>
              )}

              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">String</span>
                <p className="text-sm text-muted-foreground">{query.title}</p>
              </div>

              <div className="space-y-1">
                <button className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
                  <span>Bytes</span>
                  <span className="text-xs">▼</span>
                </button>
              </div>
            </div>
          </div>

          {/* More Information */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">More information</span>
            </div>

            <div className="space-y-3">
              {/* Identifier - for Request types */}
              {!isAsserterType && query.identifier && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Identifier</span>
                  <CopyButton
                    copyText={query.identifier}
                    buttonText={query.identifier}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Oracle Address */}
              {query.oracleAddress && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">
                    {getOracleTypeLabel()}
                  </span>
                  <CopyButton
                    copyText={query.oracleAddress}
                    buttonText={query.oracleAddress}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Requester - for Request types */}
              {!isAsserterType && query.requester && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Requester</span>
                  <CopyButton
                    copyText={query.requester}
                    buttonText={query.requester}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Requester Transaction - for Request types */}
              {!isAsserterType && query.requesterTxHash && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Requester Transaction</span>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${query.requesterTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-start gap-1 break-all"
                  >
                    <span className="break-all">{query.requesterTxHash}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                  </a>
                </div>
              )}

              {/* Proposer - for Request types */}
              {!isAsserterType && query.proposer && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Proposer</span>
                  <CopyButton
                    copyText={query.proposer}
                    buttonText={query.proposer}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Proposal Transaction - for Request types */}
              {!isAsserterType && (type === "verify" || type === "settled") && query.proposerTxHash && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Proposal Transaction</span>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${query.proposerTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-start gap-1 break-all"
                  >
                    <span className="break-all">{query.proposerTxHash}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                  </a>
                </div>
              )}

              {/* Asserter - for Asserter type */}
              {isAsserterType && query.asserter && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Asserter</span>
                  <CopyButton
                    copyText={query.asserter}
                    buttonText={query.asserter}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Asserter Transaction - for Asserter type */}
              {isAsserterType && query.asserterTxHash && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Asserter Transaction</span>
                  <a
                    href={`https://sepolia.starkscan.co/tx/${query.asserterTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-start gap-1 break-all"
                  >
                    <span className="break-all">{query.asserterTxHash}</span>
                    <ExternalLink className="h-3 w-3 flex-shrink-0 mt-1" />
                  </a>
                </div>
              )}

              {/* Caller - for Asserter type */}
              {isAsserterType && query.caller && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">Caller</span>
                  <CopyButton
                    copyText={query.caller}
                    buttonText={query.caller}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Escalation Manager - for Asserter type */}
              {isAsserterType && query.escalationManager && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">
                    Escalation Manager
                  </span>
                  <CopyButton
                    copyText={query.escalationManager}
                    buttonText={query.escalationManager}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}

              {/* Callback Recipient - for Asserter type */}
              {isAsserterType && query.callbackRecipient && (
                <div className="space-y-1">
                  <span className="text-xs font-medium text-foreground">
                    Callback Recipient
                  </span>
                  <CopyButton
                    copyText={query.callbackRecipient}
                    buttonText={query.callbackRecipient}
                    className="text-sm text-primary hover:underline block break-all"
                  />
                </div>
              )}
            </div>
          </div>

          {/* View Transaction Link */}
          {query.transactionHash && (
            <div className="pt-4 border-t border-border">
              <a
                href={`https://sepolia.starkscan.co/tx/${query.transactionHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <ExternalLink className="h-4 w-4" />
                View transaction on explorer
              </a>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QueryDetailPanel;