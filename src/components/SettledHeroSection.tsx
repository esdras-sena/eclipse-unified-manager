import { SlidersHorizontal } from "lucide-react";

interface SettledHeroSectionProps {
  requestCount: number;
}

const SettledHeroSection = ({ requestCount }: SettledHeroSectionProps) => {
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
    <section className="hero-gradient py-12 px-4">
      {/* Background gradient */}
      {/* <div className="absolute inset-0 bg-gradient-to-b from-primary/20 via-primary/5 to-transparent pointer-events-none" /> */}
      
      <div className="container mx-auto relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-lg bg-muted/50 border border-border">
            <SlidersHorizontal className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-light text-foreground">
            View {" "}
            <span className="text-primary font-semibold">{requestCount}</span>{" "}
            settled statements
          </h1>
        </div>

        {/* Steps */}
        {/* <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-6 card-shadow">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-foreground">
                    {step.number}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed text-white">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
};

export default SettledHeroSection;
