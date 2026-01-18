import { useState } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import HeroSection from "@/components/HeroSection";
import FilterBar from "@/components/FilterBar";
import QueryTable, { Query } from "@/components/QueryTable";

const mockQueries: Query[] = [
  {
    id: "1",
    title: "Q: Bills vs. Broncos: Who Will Win On January 17th, 2026? | A: Broncos",
    subtitle: "01/18/2026, 1:08 AM",
    chain: "Base",
    chainIcon: "base",
    proposal: "true",
    bond: "500",
    status: "active",
    timeLeft: "38 m 48 s",
  },
  {
    id: "2",
    title: "Verify MEV violations in ETHx staking pool",
    subtitle: "Rated | 01/17/2026, 5:37 PM",
    chain: "Ethereum",
    chainIcon: "ethereum",
    proposal: "true",
    bond: "600",
    status: "active",
    timeLeft: "11 h 7 m 30 s",
  },
  {
    id: "3",
    title: "Across V2 Request",
    subtitle: "01/15/2026, 1:35 PM",
    chain: "Ethereum",
    chainIcon: "ethereum",
    proposal: "Yes",
    bond: "0.05",
    bondToken: "ABT",
    status: "disputed",
  },
  {
    id: "4",
    title: "Across V2 Request",
    subtitle: "01/15/2026, 12:35 PM",
    chain: "Ethereum",
    chainIcon: "ethereum",
    proposal: "Yes",
    bond: "0.05",
    bondToken: "ABT",
    status: "disputed",
  },
  {
    id: "5",
    title: "Market resolved to YES",
    subtitle: "11/22/2025, 3:46 PM",
    chain: "Base",
    chainIcon: "base",
    proposal: "true",
    bond: "500",
    status: "ended",
  },
  {
    id: "6",
    title: "Claim: As of the time this assertion is resolved, the Twitter/X account with the handle '@VitalikBut...",
    subtitle: "10/17/2025, 6:25 PM",
    chain: "Base",
    chainIcon: "base",
    proposal: "true",
    bond: "0.11",
    status: "ended",
  },
  {
    id: "7",
    title: "Who will win: Connecticut vs Alabama?",
    subtitle: "04/06/2024, 2:46 PM | Event-based",
    chain: "Base",
    chainIcon: "base",
    proposal: "0",
    bond: "250",
    status: "ended",
  },
  {
    id: "8",
    title: "Who won between Argentina vs France in the World Cup 2022?",
    subtitle: "03/27/2024, 7:38 PM | Event-based",
    chain: "Optimism",
    chainIcon: "optimism",
    proposal: "0.2",
    bond: "250",
    status: "ended",
  },
  {
    id: "9",
    title: "Test market B?",
    subtitle: "10/18/2021, 1:45 AM",
    chain: "Polygon",
    chainIcon: "polygon",
    proposal: "0.000000000000000001",
    bond: "0",
    status: "disputed",
  },
];

const Index = () => {
  const [activeTab, setActiveTab] = useState("verify");

  return (
    <div className="min-h-screen bg-background">
      <AnnouncementBanner />
      <VoteTimer />
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <HeroSection statementCount={mockQueries.length} />
      <FilterBar />
      <QueryTable queries={mockQueries} />
    </div>
  );
};

export default Index;
