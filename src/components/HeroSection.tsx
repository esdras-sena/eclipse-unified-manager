import { Shield } from "lucide-react";

interface HeroSectionProps {
  statementCount: number;
}

const HeroSection = ({ statementCount }: HeroSectionProps) => {
  const steps = [
    {
      number: 1,
      text: "Proposers post a bond to assert that a piece of data is correct.",
    },
    {
      number: 2,
      text: "During the challenge period, data proposals are verified and can be disputed.",
    },
    {
      number: 3,
      text: "If correctly disputed, the data is not used and the challenger receives a reward.",
    },
  ];

  return (
    <div className="hero-gradient py-12 px-4">
      <div className="container mx-auto">
        {/* Title */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 rounded-xl bg-card/50 border border-border">
            <Shield className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl font-light text-foreground">
            Verify <span className="text-primary font-semibold">{statementCount}</span> statements
          </h1>
        </div>

        {/* Steps */}
        <div className="bg-card/60 backdrop-blur border border-border rounded-xl p-6 card-shadow">
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-4">
                <div className="flex-shrink-0 w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-sm font-medium text-foreground">{step.number}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
