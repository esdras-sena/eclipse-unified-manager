import { Clock, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const VoteTimer = () => {
  return (
    <div className="bg-secondary/50 border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm">Time to reveal vote:</span>
              <span className="text-foreground font-mono font-medium">12:30:07</span>
            </div>
            <Badge variant="secondary" className="text-xs">
              19 votes
            </Badge>
          </div>
          <a
            href="#"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            More details
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default VoteTimer;
