import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import QueryDetailPanel from "./QueryDetailPanel";

export interface ProposeQuery {
  id: string;
  title: string;
  timestamp: string;
  chain: string;
  chainIcon: string;
  type: string;
  oracleType: string;
  bond: string;
  reward: string;
  // Extended fields for detail panel
  transactionHash?: string;
  eventIndex?: string;
  description?: string;
  requestedTime?: string;
  requestedTimeUnix?: string;
  asserter?: string;
  escalationManager?: string;
  callbackRecipient?: string;
}

interface ProposeQueryTableProps {
  queries: ProposeQuery[];
}

const ProposeQueryTable = ({ queries }: ProposeQueryTableProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedQuery, setSelectedQuery] = useState<ProposeQuery | null>(() => {
    const txHash = searchParams.get("transactionHash");
    const eventIndex = searchParams.get("eventIndex");
    if (txHash && eventIndex) {
      return queries.find(q => q.transactionHash === txHash && q.eventIndex === eventIndex) || null;
    }
    return null;
  });

  const handleRowClick = (query: ProposeQuery) => {
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

  // Convert ProposeQuery to the format expected by QueryDetailPanel
  const convertToDetailQuery = (query: ProposeQuery | null) => {
    if (!query) return null;
    return {
      id: query.id,
      title: query.title,
      subtitle: query.timestamp,
      chain: query.chain,
      proposal: "—",
      bond: query.bond,
      status: "active" as const,
      oracleType: query.oracleType,
      reward: query.reward,
      description: query.description,
      requestedTime: query.requestedTime || query.timestamp,
      requestedTimeUnix: query.requestedTimeUnix,
      asserter: query.asserter,
      escalationManager: query.escalationManager,
      callbackRecipient: query.callbackRecipient,
    };
  };

  return (
    <>
      <div className="container mx-auto px-4 pb-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Query
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Type
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Bond
                </th>
                <th className="text-left py-4 px-4 text-sm font-medium text-muted-foreground">
                  Reward
                </th>
                <th className="w-12"></th>
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
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <div className="w-5 h-5 rounded-full bg-muted-foreground/20 flex items-center justify-center">
                            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium text-primary hover:underline truncate max-w-[500px]">
                          {query.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground">
                            {query.timestamp}
                          </span>
                          <span className="text-muted-foreground">|</span>
                          <span className="text-xs text-muted-foreground">
                            {query.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-muted-foreground">
                      {query.oracleType}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm text-foreground">{query.bond}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                      <span className="text-sm text-foreground">{query.reward}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end">
                      <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center hover:bg-muted">
                        <ChevronRight className="h-4 w-4 text-muted-foreground" style={{color: "white"}} />
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
        query={convertToDetailQuery(selectedQuery)}
        type="propose"
      />
    </>
  );
};

export default ProposeQueryTable;
