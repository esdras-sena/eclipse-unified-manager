import { useState, useMemo } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import ProposeHeroSection from "@/components/ProposeHeroSection";
import FilterBar, { OracleFilterValue } from "@/components/FilterBar";
import ProposeQueryTable, { ProposeQuery } from "@/components/ProposeQueryTable";
import { useNavigate } from "react-router-dom";
import { useProposeQueries } from "@/web3/hooks";

const Propose = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("propose");
  const [selectedOracle, setSelectedOracle] = useState<OracleFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { queries: rawQueries, loading, error } = useProposeQueries();

  const filteredQueries = useMemo(() => {
    let filtered: ProposeQuery[] = rawQueries.map(q => ({
      id: q.id,
      title: q.title,
      timestamp: q.subtitle,
      type: q.eventBased ? "Event-based" : "Standard",
      oracleType: q.oracleType,
      bond: q.bond,
      reward: q.reward || "0",
      transactionHash: q.transactionHash,
      eventIndex: q.eventIndex,
      description: q.description,
      eventBased: q.eventBased,
      identifier: q.identifier,
      identifierRaw: q.identifierRaw,
      requester: q.requester,
      requesterTxHash: q.requesterTxHash,
      requestedTime: q.requestedTime,
      requestedTimeUnix: q.requestedTimeUnix,
      oracleAddress: q.oracleAddress,
      asserter: q.asserter,
      asserterTxHash: q.asserterTxHash,
      caller: q.caller,
      escalationManager: q.escalationManager,
      callbackRecipient: q.callbackRecipient,
    }));
    
    if (selectedOracle !== "all") {
      filtered = filtered.filter(q => q.oracleType === selectedOracle);
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(q => q.title.toLowerCase().includes(query));
    }
    
    return filtered;
  }, [rawQueries, selectedOracle, searchQuery]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "verify") {
      navigate("/");
    } else if (tab === "settled") {
      navigate("/settled");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <VoteTimer />
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <ProposeHeroSection requestCount={filteredQueries.length} />
      <FilterBar 
        selectedOracle={selectedOracle} 
        onOracleChange={setSelectedOracle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      {loading ? (
        <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
          Loading queries from Starknet...
        </div>
      ) : error ? (
        <div className="container mx-auto px-4 py-12 text-center text-destructive">
          Error loading data: {error.message}
        </div>
      ) : (
        <ProposeQueryTable queries={filteredQueries} />
      )}
    </div>
  );
};

export default Propose;
