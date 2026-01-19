import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import HeroSection from "@/components/HeroSection";
import FilterBar, { OracleFilterValue } from "@/components/FilterBar";
import QueryTable, { Query } from "@/components/QueryTable";
import { useVerifyQueries } from "@/web3/hooks";

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("verify");
  const [selectedOracle, setSelectedOracle] = useState<OracleFilterValue>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  const { queries: rawQueries, loading, error } = useVerifyQueries();

  const filteredQueries = useMemo(() => {
    // Map CombinedQuery to Query type
    let filtered: Query[] = rawQueries.map(q => ({
      id: q.id,
      title: q.title,
      subtitle: q.subtitle,
      proposal: q.proposal,
      bond: q.bond,
      bondToken: q.bondToken,
      status: q.status,
      timeLeft: q.timeLeft,
      transactionHash: q.transactionHash,
      eventIndex: q.eventIndex,
      description: q.description,
      eventBased: q.eventBased,
      oracleType: q.oracleType,
      reward: q.reward,
      identifier: q.identifier,
      requester: q.requester,
      requesterTxHash: q.requesterTxHash,
      proposer: q.proposer,
      proposerTxHash: q.proposerTxHash,
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
    if (tab === "propose") {
      navigate("/propose");
    } else if (tab === "settled") {
      navigate("/settled");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <VoteTimer />
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <HeroSection statementCount={filteredQueries.length} />
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
        <QueryTable queries={filteredQueries} />
      )}
    </div>
  );
};

export default Index;
