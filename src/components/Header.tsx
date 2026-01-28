import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { ConnectButton } from "./ConnectButton";
import eclipseLogo from "@/assets/eclipse-logo.png";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const tabs = [
    { id: "verify", label: "Verify" },
    { id: "propose", label: "Propose" },
    { id: "settled", label: "Settled" },
  ];

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-1">
            <img src={eclipseLogo} alt="Eclipse" className="h-12 w-12 -mr-2 object-contain" />
            <span className="text-xl font-semibold text-primary tracking-wide">ECLIPSE</span>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "navActive" : "nav"}
                onClick={() => onTabChange(tab.id)}
                className="px-4"
              >
                {tab.label}
              </Button>
            ))}
            <a
              href="#"
              className="flex items-center gap-1 px-4 py-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
            >
              Docs
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>

          {/* Connect Wallet */}
          <ConnectButton/>
        </div>
      </div>
    </header>
  );
};

export default Header;
