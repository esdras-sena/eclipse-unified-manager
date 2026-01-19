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
    title: "Q: Bills vs. Broncos: Who Will Win On January 17th, 2026? | A: Broncos",
    timestamp: "01/18/2026, 1:08 AM",
    chain: "Base",
    chainIcon: "base",
    type: "Event-based",
    oracleType: "Optimistic Oracle V3",
    bond: "500",
    reward: "5",
    result: "true",
    transactionHash: "0x212aadb2399b0d224b0a800fa52651d523b9a05803a7a72159361791057e051c",
    eventIndex: "895",
    description: "Q: Bills vs. Broncos: Who Will Win On January 17th, 2026? | A: Broncos",
  },
  {
    id: "2",
    title: "Verify MEV violations in ETHx staking pool",
    timestamp: "01/17/2026, 5:37 PM",
    chain: "Ethereum",
    chainIcon: "ethereum",
    type: "Standard",
    oracleType: "Optimistic Oracle V3",
    bond: "600",
    reward: "10",
    result: "true",
    transactionHash: "0x323bbec3400c1e335c1b911gb63762e634c0b16914b8b83260472802168f162d",
    eventIndex: "896",
    description: "Verification of MEV violations in ETHx staking pool.",
  },
  {
    id: "3",
    title: "Unable to decode hex string",
    timestamp: "01/17/2026, 1:40 AM",
    chain: "Polygon",
    chainIcon: "polygon",
    type: "Standard",
    oracleType: "Optimistic Oracle V3",
    bond: "100",
    reward: "2",
    result: "true",
    transactionHash: "0x434ccfd4511d2f446d2c022hc74873f745d1c27025c9c94371583913279g273e",
    eventIndex: "897",
    description: "Hex string decoding verification request.",
  },
  {
    id: "4",
    title: "Verify MEV violations in ETHx staking pool",
    timestamp: "01/16/2026, 5:37 PM",
    chain: "Ethereum",
    chainIcon: "ethereum",
    type: "Standard",
    oracleType: "Optimistic Oracle V3",
    bond: "600",
    reward: "10",
    result: "true",
    transactionHash: "0x545ddge5622e3g557e3d133id85984g856e2d38136d0d05482694024380h384f",
    eventIndex: "898",
    description: "Verification of MEV violations in ETHx staking pool.",
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
