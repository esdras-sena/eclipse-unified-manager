import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

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
}

interface ProposeQueryTableProps {
  queries: ProposeQuery[];
}

const ChainIcon = ({ chain }: { chain: string }) => {
  const getChainColor = (chain: string) => {
    switch (chain.toLowerCase()) {
      case "ethereum":
        return "bg-blue-500";
      case "base":
        return "bg-blue-600";
      case "arbitrum":
        return "bg-sky-500";
      case "optimism":
        return "bg-red-500";
      case "polygon":
        return "bg-purple-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div
      className={`w-5 h-5 rounded-full ${getChainColor(chain)} flex items-center justify-center`}
    >
      <span className="text-white text-xs font-bold">
        {chain.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};

const ProposeQueryTable = ({ queries }: ProposeQueryTableProps) => {
  return (
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
            {queries.map((query) => (
              <tr
                key={query.id}
                className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer group"
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
                      <p className="text-sm font-medium text-primary hover:underline truncate max-w-[500px]">
                        {query.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {query.timestamp}
                        </span>
                        <span className="text-muted-foreground">|</span>
                        <div className="flex items-center gap-1">
                          <ChainIcon chain={query.chain} />
                          <span className="text-xs text-muted-foreground">
                            {query.chain}
                          </span>
                        </div>
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
                  <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProposeQueryTable;
