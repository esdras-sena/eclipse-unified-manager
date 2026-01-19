import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
    transactionHash: "0xc77cb2a7d7ac77d425e1d2203dbcddddad8e133d5a27ec4d51737649b9b6c29c",
    eventIndex: "1",
    description: "This market will resolve based on the outcome of the Bills vs. Broncos NFL game on January 17th, 2026.",
    oracleType: "Optimistic Oracle V3",
    reward: "5",
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
    transactionHash: "0xd88cb3a8d8ac88d526e2d3304dbceeeeae9e244d6b28fc5d62848760c0c7d30d",
    eventIndex: "2",
    description: "Verify if there were any MEV violations in the ETHx staking pool during the specified period.",
    oracleType: "Optimistic Oracle V3",
    reward: "10",
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
    transactionHash: "0xe99dc4b9e9bd99e627f3e4415ecdfffffbf0355e7c39gd6e73959871d1d8e41e",
    eventIndex: "3",
    description: "Cross-chain bridge request verification for Across Protocol V2.",
    oracleType: "Optimistic Oracle V2",
    reward: "2",
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
    transactionHash: "0xf00ed5c0f0ce00f738g4f5526fdeg0000cg1466f8d40he7f84060982e2e9f52f",
    eventIndex: "4",
    description: "Cross-chain bridge request verification for Across Protocol V2.",
    oracleType: "Optimistic Oracle V2",
    reward: "2",
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
    transactionHash: "0x111fe6d1g1df11g849h5g6637gfeh1111dh2577g9e51if8g95171093f3f0g63g",
    eventIndex: "5",
    description: "Prediction market resolution for a binary outcome event.",
    oracleType: "Optimistic Oracle V3",
    reward: "5",
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
    transactionHash: "0x222gf7e2h2eg22h950i6h7748hgfi2222ei3688h0f62jg9h06282104g4g1h74h",
    eventIndex: "6",
    description: "Verification of Twitter/X account ownership claim.",
    oracleType: "Optimistic Oracle V3",
    reward: "1",
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
    transactionHash: "0x333hg8f3i3fh33i061j7i8859ihhj3333fj4799i1g73kh0i17393215h5h2i85i",
    eventIndex: "7",
    description: "NCAA Basketball championship game outcome prediction.",
    oracleType: "Optimistic Oracle V3",
    reward: "5",
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
    transactionHash: "0x444ih9g4j4gi44j172k8j9960jiki4444gk5800j2h84li1j28404326i6i3j96j",
    eventIndex: "8",
    description: "FIFA World Cup 2022 Final outcome verification.",
    oracleType: "Optimistic Oracle V3",
    reward: "5",
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
    transactionHash: "0x555ji0h5k5hj55k283l9k0071kjlj5555hl6911k3i95mj2k39515437j7j4k07k",
    eventIndex: "9",
    description: "Test market for development purposes.",
    oracleType: "Optimistic Oracle V2",
    reward: "0",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("verify");

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
      <HeroSection statementCount={mockQueries.length} />
      <FilterBar />
      <QueryTable queries={mockQueries} />
    </div>
  );
};

export default Index;
