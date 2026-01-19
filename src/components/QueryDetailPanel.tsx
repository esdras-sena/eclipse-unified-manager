import { X, Info, Clock, FileText, ExternalLink, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CopyButton from "./lib/CopyButton";

interface QueryDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  query: {
    id: string;
    title: string;
    subtitle: string;
    chain: string;
    proposal: string;
    bond: string;
    bondToken?: string;
    status: "active" | "ended" | "disputed";
    timeLeft?: string;
    // Extended data for detail view
    description?: string;
    requestedTime?: string;
    requestedTimeUnix?: string;
    oracleType?: string;
    asserter?: string;
    escalationManager?: string;
    callbackRecipient?: string;
    reward?: string;
  } | null;
  type: "verify" | "propose" | "settled";
}

const QueryDetailPanel = ({ isOpen, onClose, query, type }: QueryDetailPanelProps) => {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 overflow-y-auto animate-slide-in-right">
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

            <div className="bg-muted/50 rounded-lg p-3 border border-border">
              <span className="text-sm text-foreground">
                Proposal: {query.proposal}
              </span>
            </div>
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

          {/* Chain & Oracle Type */}
          <div className="flex items-center gap-2 py-3 border-t border-border">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
              <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                <span className="text-white text-[8px] font-bold">
                  {query.chain.charAt(0)}
                </span>
              </div>
              <span className="text-xs text-muted-foreground">{query.chain}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/50 rounded-full border border-border">
              <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                <span className="text-xs text-muted-foreground">○○</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {query.oracleType || "Optimistic Oracle V3"}
              </span>
            </div>
          </div>

          {/* Timestamp Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Timestamp</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Requested Time</span>
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
                  {query.requestedTimeUnix || "1768561402"}
                </span>
              </div>
            </div>

            {type === "settled" && (
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Settled Time</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UTC</span>
                  <span className="text-sm text-foreground">
                    Sun, 18 Jan 2026 12:15:21 GMT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">UNIX</span>
                  <span className="text-sm text-foreground">1768738521</span>
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
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">Description</span>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {query.description ||
                    "This market will resolve to the temperature range that contains the highest temperature recorded at the Seattle-Tacoma International Airport Station in degrees Fahrenheit on 18 Jan '26."}
                </p>
              </div>

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
              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">
                  {query.oracleType || "Optimistic Oracle V3"}
                </span>
                <CopyButton
                  copyText="0x2aBf1Bd76655de80eDB3086114315Eec75AF500c"
                  buttonText="0x2aBf1Bd76655de80eDB3086114315Eec75AF500c"
                  className="text-sm text-primary hover:underline block truncate"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">Asserter</span>
                <CopyButton
                  copyText={query.asserter || "0x41779cf643f5302fe64c1eff4c128b9abca257d0"}
                  buttonText={query.asserter || "0x41779cf643f5302fe64c1eff4c128b9abca257d0"}
                  className="text-sm text-primary hover:underline block truncate"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">
                  Escalation Manager
                </span>
                <CopyButton
                  copyText={
                    query.escalationManager ||
                    "0x0000000000000000000000000000000000000000"
                  }
                  buttonText={
                    query.escalationManager ||
                    "0x0000000000000000000000000000000000000000"
                  }
                  className="text-sm text-primary hover:underline block truncate"
                />
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-foreground">
                  Callback Recipient
                </span>
                <CopyButton
                  copyText={
                    query.callbackRecipient ||
                    "0x47ee4de132e2404ae166b644487a44189c04c26c"
                  }
                  buttonText={
                    query.callbackRecipient ||
                    "0x47ee4de132e2404ae166b644487a44189c04c26c"
                  }
                  className="text-sm text-primary hover:underline block truncate"
                />
              </div>
            </div>
          </div>

          {/* View Transaction Link */}
          <div className="pt-4 border-t border-border">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              View transaction on explorer
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default QueryDetailPanel;
