import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FilterBar = () => {
  return (
    <div className="bg-background py-6 px-4 border-b border-border">
      <div className="container mx-auto">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search"
              className="pl-10 bg-card border-border"
            />
          </div>

          {/* Project Filter */}
          <Select>
            <SelectTrigger className="w-[160px] bg-card border-border">
              <SelectValue placeholder="Project" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Projects</SelectItem>
              {/* <SelectItem value="polymarket">Polymarket</SelectItem>
              <SelectItem value="across">Across</SelectItem>
              <SelectItem value="rated">Rated</SelectItem> */}
            </SelectContent>
          </Select>

          {/* Chain Filter */}
          {/* <Select>
            <SelectTrigger className="w-[160px] bg-card border-border">
              <SelectValue placeholder="Chain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Chains</SelectItem>
              <SelectItem value="ethereum">Ethereum</SelectItem>
              <SelectItem value="base">Base</SelectItem>
              <SelectItem value="optimism">Optimism</SelectItem>
              <SelectItem value="polygon">Polygon</SelectItem>
            </SelectContent>
          </Select> */}

          {/* Oracle Filter */}
          <Select>
            <SelectTrigger className="w-[250px] bg-card border-border">
              <SelectValue placeholder="All Oracles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Oracles</SelectItem>
              <SelectItem value="optimistic oracle">Optimistic Oracle</SelectItem>
              <SelectItem value="optimistic oracle managed">Optimistic Oracle Managed</SelectItem>
              <SelectItem value="optimistic oracle asserter">Optimistic Oracle Asserter</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
