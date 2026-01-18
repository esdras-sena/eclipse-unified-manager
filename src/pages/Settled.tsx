import { useState } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import SettledHeroSection from "@/components/SettledHeroSection";
import FilterBar from "@/components/FilterBar";
import SettledQueryTable, { SettledQuery } from "@/components/SettledQueryTable";
import { useNavigate } from "react-router-dom";

const mockProposeQueries: SettledQuery[] = [
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
    result: "true"
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
    result: "true"
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
    result: "true"
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
    result: "true"
  },
];

const Settled = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("settled");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === "verify") {
      navigate("/");
    } else if (tab === "propose") {
      navigate("/propose");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <VoteTimer />
      <Header activeTab={activeTab} onTabChange={handleTabChange} />
      <SettledHeroSection requestCount={mockProposeQueries.length} />
      <FilterBar />
      <SettledQueryTable queries={mockProposeQueries} />
    </div>
  );
};

export default Settled;
