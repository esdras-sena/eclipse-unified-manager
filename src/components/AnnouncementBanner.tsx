import { ExternalLink } from "lucide-react";

const AnnouncementBanner = () => {
  return (
    <div className="accent-gradient py-2.5 px-4">
      <div className="container mx-auto">
        <p className="text-center text-sm text-primary-foreground">
          Eclipse's{" "}
          <span className="font-semibold">Managed Optimistic Oracle V2</span>{" "}
          contract is now live! Please review these new requests on the "Verify" and "Propose" tabs and see our{" "}
          <a href="#" className="underline inline-flex items-center gap-1 hover:opacity-80 transition-opacity">
            docs
            <ExternalLink className="h-3 w-3" />
          </a>{" "}
          for more information.
        </p>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
