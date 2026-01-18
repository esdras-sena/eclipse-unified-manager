import { useState } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import ProposeHeroSection from "@/components/ProposeHeroSection";
import FilterBar from "@/components/FilterBar";
import ProposeQueryTable, { ProposeQuery } from "@/components/ProposeQueryTable";
import { useNavigate } from "react-router-dom";

const mockProposeQueries: ProposeQuery[] = [
  {
    id: "1",
    title: "6usJM7UjJnMv7cviNs3PtK9CPSwRzCmQpe2tE3bfBhaU",
    timestamp: "01/17/2026, 9:20 AM",
    chain: "Base",
    chainIcon: "base",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "251",
    reward: "1",
  },
  {
    id: "2",
    title: "Will at least one Ferrari 250 GTO offered at the Mecum Kissimmee auction on 17 January 2026 be sold ...",
    timestamp: "01/16/2026, 10:26 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "3",
    title: "Did the Chicago Bears record strictly more than 105 total team rushing yards in the official final b...",
    timestamp: "01/16/2026, 7:49 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "4",
    title: "Did exactly 3 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "5",
    title: "Did exactly 1 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "6",
    title: "Did exactly 0 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "7",
    title: "Did exactly 2 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    chain: "Arbitrum",
    chainIcon: "arbitrum",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "500",
    reward: "5",
  },
  {
    id: "8",
    title: "What will be the result of the Crystal Palace vs Brentford match on January 18th, 2026?",
    timestamp: "01/16/2026, 6:30 PM",
    chain: "Base",
    chainIcon: "base",
    type: "Event-based",
    oracleType: "Optimistic Oracle V2",
    bond: "250",
    reward: "3",
  },
];

const Propose = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("propose");

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
      <ProposeHeroSection requestCount={mockProposeQueries.length} />
      <FilterBar />
      <ProposeQueryTable queries={mockProposeQueries} />
    </div>
  );
};

export default Propose;
