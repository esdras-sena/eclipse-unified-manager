import { Settings2 } from "lucide-react";

interface ProposeHeroSectionProps {
  requestCount: number;
}

const ProposeHeroSection = ({ requestCount }: ProposeHeroSectionProps) => {
  const steps = [
    {
      number: 1,
      text: "Data consumers post reward bounties in return for data.",
    },
    {
      number: 2,
      text: "Proposers can post a bond to answer a data request.",
    },
    {
      number: 3,
      text: "If a proposal goes unchallenged, the proposer receives the reward after liveness.",
    },
  ];

  return (
    <section className="relative py-16 px-4">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <Settings2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-light text-foreground">
            Propose answers to{" "}
            <span className="text-primary font-semibold">{requestCount}</span>{" "}
            requests
          </h1>
        </div>

        {/* Steps */}
        <div className="bg-muted/30 border border-border rounded-xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-primary flex items-center justify-center">
                  <span className="text-primary text-sm font-medium">
                    {step.number}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProposeHeroSection;
