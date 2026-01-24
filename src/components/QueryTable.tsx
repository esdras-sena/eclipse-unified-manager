import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import QueryDetailPanel, { OracleType } from "./QueryDetailPanel";

export interface Query {
  id: string;
  title: string;
  subtitle: string;
  proposal: string;
  bond: string;
  bondToken?: string;
  status: "active" | "ended" | "disputed";
  timeLeft?: string;
  expirationTimestamp?: number; // Unix timestamp for live countdown
  // Extended fields for detail panel
  transactionHash?: string;
  eventIndex?: string;
  description?: string;
  eventBased?: boolean;
  oracleType?: OracleType;
  // Timestamp data
  requestedTime?: string;
  requestedTimeUnix?: string;
  proposedTime?: string;
  proposedTimeUnix?: string;
  // Request-type fields
  identifier?: string;
  requester?: string;
  requesterTxHash?: string;
  proposer?: string;
  proposerTxHash?: string;
  // Asserter-type fields
  asserter?: string;
  asserterTxHash?: string;
  caller?: string;
  escalationManager?: string;
  callbackRecipient?: string;
  oracleAddress?: string;
  reward?: string;
}

interface QueryTableProps {
  queries: Query[];
}

const getChainColor = (chain: string) => {
  const colors: Record<string, string> = {
    Base: "bg-blue-500/20 text-blue-400",
    Ethereum: "bg-purple-500/20 text-purple-400",
    Optimism: "bg-red-500/20 text-red-400",
    Polygon: "bg-violet-500/20 text-violet-400",
  };
  return colors[chain] || "bg-muted text-muted-foreground";
};

const QueryTable = ({ queries }: QueryTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedQuery, setSelectedQuery] = useState<Query | null>(null);
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));

  // Single shared timer for all rows (keeps table countdowns live)
  useEffect(() => {
    const id = window.setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, []);

  const getChallengeLeft = (q: Query): { label: string; ended: boolean } => {
    const exp = q.expirationTimestamp;
    if (!exp) return { label: q.timeLeft || "—", ended: false };

    const diff = exp - now;
    if (diff <= 0) return { label: "Ended", ended: true };

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;

    if (hours > 0) return { label: `${hours} h ${minutes} m ${seconds} s`, ended: false };
    if (minutes > 0) return { label: `${minutes} m ${seconds} s`, ended: false };
    return { label: `${seconds} s`, ended: false };
  };

  // Sync selected query with URL params when queries change
  useEffect(() => {
    const txHash = searchParams.get("transactionHash");
    const eventIndex = searchParams.get("eventIndex");
    if (txHash && eventIndex) {
      const found = queries.find(q => q.transactionHash === txHash && q.eventIndex === eventIndex);
      if (found) {
        setSelectedQuery(found);
      }
    }
  }, [queries, searchParams]);

  const handleRowClick = (query: Query) => {
    setSelectedQuery(query);
    if (query.transactionHash && query.eventIndex) {
      setSearchParams({
        transactionHash: query.transactionHash,
        eventIndex: query.eventIndex,
      });
    }
  };

  const handleClosePanel = () => {
    setSelectedQuery(null);
    setSearchParams({});
  };

  return (
    <>
      <div className="container mx-auto px-4 py-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Query
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Proposal
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Bond
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Challenge period left
                </th>
                <th className="py-4 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {queries.map((query, index) => (
                <tr
                  key={query.id}
                  className="table-row-hover border-b border-border/50 cursor-pointer animate-slide-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleRowClick(query)}
                >
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">○○</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-medium text-foreground line-clamp-2">
                          {query.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{query.subtitle}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-foreground">{query.proposal}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-foreground">
                        {query.bond}
                        {query.bondToken && (
                          <span className="text-muted-foreground ml-1">{query.bondToken}</span>
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {query.status === "active" && (() => {
                      const { label, ended } = getChallengeLeft(query);
                      return (
                        <span
                          className={
                            ended
                              ? "text-sm text-muted-foreground font-medium"
                              : "text-sm status-active font-medium animate-pulse-glow"
                          }
                        >
                          {label}
                        </span>
                      );
                    })()}
                    {query.status === "ended" && (
                      <Badge variant="ended">Ended</Badge>
                    )}
                    {query.status === "disputed" && (
                      <Badge variant="disputed">Disputed</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-colors">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" style={{color: "white"}}/>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QueryDetailPanel
        isOpen={!!selectedQuery}
        onClose={handleClosePanel}
        query={selectedQuery}
        type="verify"
      />
    </>
  );
};

export default QueryTable;
