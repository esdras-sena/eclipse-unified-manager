import { useState } from "react";
import Header from "@/components/Header";
import AnnouncementBanner from "@/components/AnnouncementBanner";
import VoteTimer from "@/components/VoteTimer";
import SettledHeroSection from "@/components/SettledHeroSection";
import FilterBar from "@/components/FilterBar";
import SettledQueryTable, { SettledQuery } from "@/components/SettledQueryTable";
import { useNavigate } from "react-router-dom";

const mockSettledQueries: SettledQuery[] = [
  // Optimistic Oracle Asserter items - use asserter-specific fields
  {
    id: "1",
    title: "Q: Bills vs. Broncos: Who Will Win On January 17th, 2026? | A: Broncos",
    timestamp: "01/18/2026, 1:08 AM",
    type: "Event-based",
    oracleType: "optimistic-oracle-asserter",
    bond: "500",
    reward: "5",
    result: "true",
    transactionHash: "0x212aadb2399b0d224b0a800fa52651d523b9a05803a7a72159361791057e051c",
    eventIndex: "895",
    description: "Q: Bills vs. Broncos: Who Will Win On January 17th, 2026? | A: Broncos",
    eventBased: true,
    proposedTime: "Sun, 18 Jan 2026 00:30:00 GMT",
    proposedTimeUnix: "1768730200",
    settledTime: "Sun, 18 Jan 2026 01:08:00 GMT",
    settledTimeUnix: "1768732080",
    asserter: "0x52880dg754g5413gf75d2efg5c239c0gcb368e1",
    asserterTxHash: "0xdef456...",
    escalationManager: "0x0000000000000000000000000000000000000000",
    callbackRecipient: "0x41779cf643f5302fe64c1eff4c128b9abca257d0",
  },
  {
    id: "2",
    title: "Verify MEV violations in ETHx staking pool",
    timestamp: "01/17/2026, 5:37 PM",
    type: "Standard",
    oracleType: "optimistic-oracle-asserter",
    bond: "600",
    reward: "10",
    result: "true",
    transactionHash: "0x323bbec3400c1e335c1b911gb63762e634c0b16914b8b83260472802168f162d",
    eventIndex: "896",
    description: "Verification of MEV violations in ETHx staking pool.",
    eventBased: false,
    proposedTime: "Fri, 17 Jan 2026 14:00:00 GMT",
    proposedTimeUnix: "1768694400",
    settledTime: "Fri, 17 Jan 2026 17:37:00 GMT",
    settledTimeUnix: "1768707420",
    asserter: "0x74002fi976i7635ih97f4ghi7e451e2ied580g3",
    asserterTxHash: "0xjkl012...",
    escalationManager: "0x0000000000000000000000000000000000000000",
    callbackRecipient: "0x63991eh865h6524hg86e3fgh6d340d1hdc479f2",
  },
  // Optimistic Oracle items - use request-specific fields
  {
    id: "3",
    title: "Unable to decode hex string",
    timestamp: "01/17/2026, 1:40 AM",
    type: "Standard",
    oracleType: "optimistic-oracle",
    bond: "100",
    reward: "2",
    result: "true",
    transactionHash: "0x434ccfd4511d2f446d2c022hc74873f745d1c27025c9c94371583913279g273e",
    eventIndex: "897",
    description: "Hex string decoding verification request.",
    eventBased: false,
    proposedTime: "Thu, 16 Jan 2026 22:00:00 GMT",
    proposedTimeUnix: "1768636800",
    settledTime: "Fri, 17 Jan 2026 01:40:00 GMT",
    settledTimeUnix: "1768650000",
    identifier: "YES_OR_NO_QUERY",
    requester: "0x85113gj087j8746ji08g5hij8f562f3jfe691h4",
    requesterTxHash: "0xmno345...",
    proposer: "0x96224hk198k9857kj19h6ijk9g673g4kgf702i5",
    proposerTxHash: "0xpqr678...",
  },
  // Optimistic Oracle Managed items - use request-specific fields
  {
    id: "4",
    title: "Verify MEV violations in ETHx staking pool",
    timestamp: "01/16/2026, 5:37 PM",
    type: "Standard",
    oracleType: "optimistic-oracle-managed",
    bond: "600",
    reward: "10",
    result: "true",
    transactionHash: "0x545ddge5622e3g557e3d133id85984g856e2d38136d0d05482694024380h384f",
    eventIndex: "898",
    description: "Verification of MEV violations in ETHx staking pool.",
    eventBased: false,
    proposedTime: "Thu, 16 Jan 2026 14:00:00 GMT",
    proposedTimeUnix: "1768608000",
    settledTime: "Thu, 16 Jan 2026 17:37:00 GMT",
    settledTimeUnix: "1768621020",
    identifier: "YES_OR_NO_QUERY",
    requester: "0x07335il209l0968lk20i7jkl0h784h5lhg813j6",
    requesterTxHash: "0xstu901...",
    proposer: "0x18446jm310m1079ml31j8klm1i895i6mih924k7",
    proposerTxHash: "0xvwx234...",
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
      <SettledHeroSection requestCount={mockSettledQueries.length} />
      <FilterBar />
      <SettledQueryTable queries={mockSettledQueries} />
    </div>
  );
};

export default Settled;