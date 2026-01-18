import { ChevronRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface Query {
  id: string;
  title: string;
  subtitle: string;
  chain: string;
  chainIcon: string;
  proposal: string;
  bond: string;
  bondToken?: string;
  status: "active" | "ended" | "disputed";
  timeLeft?: string;
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
  return (
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
                        <span>|</span>
                        <Badge className={`text-xs ${getChainColor(query.chain)}`}>
                          ◆ {query.chain}
                        </Badge>
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
                  {query.status === "active" && query.timeLeft && (
                    <span className="text-sm status-active font-medium animate-pulse-glow">
                      {query.timeLeft}
                    </span>
                  )}
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
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default QueryTable;
