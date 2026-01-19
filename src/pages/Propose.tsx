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
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "251",
    reward: "1",
    transactionHash: "0x18c74872259a27d6bb360c14006fcf83fdffeb45ddab71fd4657a6d08ea244a2",
    eventIndex: "1",
    description: "Propose an answer for this data request.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x41779cf643f5302fe64c1eff4c128b9abca257d0",
    requesterTxHash: "0xabc123...",
  },
  {
    id: "2",
    title: "Will at least one Ferrari 250 GTO offered at the Mecum Kissimmee auction on 17 January 2026 be sold ...",
    timestamp: "01/16/2026, 10:26 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x29d85983370b38e7cc471d15117gde94geggfc56eecb82ge5768b7e19fb355b3",
    eventIndex: "2",
    description: "Will at least one Ferrari 250 GTO be sold at the specified auction?",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x52880dg754g5413gf75d2efg5c239c0gcb368e1",
    requesterTxHash: "0xdef456...",
  },
  {
    id: "3",
    title: "Did the Chicago Bears record strictly more than 105 total team rushing yards in the official final b...",
    timestamp: "01/16/2026, 7:49 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x30e96094481c49f8dd582e26228hef05hfhhgd67ffdC93hf6879c8f20gc466c4",
    eventIndex: "3",
    description: "Verify Chicago Bears rushing yards for the specified game.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x63991eh865h6524hg86e3fgh6d340d1hdc479f2",
    requesterTxHash: "0xghi789...",
  },
  {
    id: "4",
    title: "Did exactly 3 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x41f07105592d50g9ee693f37339ifg16igiihE78ggEd04ig7980d9g31hd577d5",
    eventIndex: "4",
    description: "Count of 49ers player injuries during specified game.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x74002fi976i7635ih97f4ghi7e451e2ied580g3",
    requesterTxHash: "0xjkl012...",
  },
  {
    id: "5",
    title: "Did exactly 1 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x52g18216603e61h0ff704g48440jgh27jhjjif89hhfe15jh8091e0h42ie688e6",
    eventIndex: "5",
    description: "Count of 49ers player injuries during specified game.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x85113gj087j8746ji08g5hij8f562f3jfe691h4",
    requesterTxHash: "0xmno345...",
  },
  {
    id: "6",
    title: "Did exactly 0 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x63h29327714f72i1gg815h59551khh38kiKkjg90iigf26ki9102f1i53jf799f7",
    eventIndex: "6",
    description: "Count of 49ers player injuries during specified game.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x96224hk198k9857kj19h6ijk9g673g4kgf702i5",
    requesterTxHash: "0xpqr678...",
  },
  {
    id: "7",
    title: "Did exactly 2 San Francisco 49ers players sustain an injury during the San Francisco 49ers' next off...",
    timestamp: "01/16/2026, 7:45 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "500",
    reward: "5",
    transactionHash: "0x74i30438825g83j2hh926i66662lii49ljllkh01jjhg37lj0213g2j64kg800g8",
    eventIndex: "7",
    description: "Count of 49ers player injuries during specified game.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x07335il209l0968lk20i7jkl0h784h5lhg813j6",
    requesterTxHash: "0xstu901...",
  },
  {
    id: "8",
    title: "What will be the result of the Crystal Palace vs Brentford match on January 18th, 2026?",
    timestamp: "01/16/2026, 6:30 PM",
    type: "Event-based",
    oracleType: "optimistic-oracle",
    bond: "250",
    reward: "3",
    transactionHash: "0x85j41549936h94k3ii037j77773mjj50mkmmlii2kkjh48mk1324h3k75lh911h9",
    eventIndex: "8",
    description: "Premier League match outcome prediction.",
    eventBased: true,
    identifier: "YES_OR_NO_QUERY",
    requester: "0x18446jm310m1079ml31j8klm1i895i6mih924k7",
    requesterTxHash: "0xvwx234...",
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
