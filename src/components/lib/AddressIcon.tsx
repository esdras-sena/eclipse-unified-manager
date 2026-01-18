import {
  useAccount,
  useDisconnect,
  useStarkProfile,
  useConnect,
  useSwitchChain,
  useNetwork,
} from "@starknet-react/core";
import { useEffect, useState } from "react";
import { blo } from 'blo';

const AddressBar = () => {
  const { address } = useAccount();
  
  const { data: starkProfile } = useStarkProfile({
    address,
  });
  const [imageError, setImageError] = useState(false);
  if (!address) {
    return null;
  }

  const togglePopover = ({ targetId }: { targetId: string }) => {
    const popover = document.getElementById(targetId);
    // @ts-ignore
    popover.togglePopover();
    if (popover) {
      popover.addEventListener("toggle", () => {
        if (popover.matches(":popover-open")) {
          document.body.style.overflow = "hidden";
        } else {
          document.body.style.overflow = "auto";
        }
      });
    }
  };

  return (
    <>
      <span className="flex items-center">
            {!imageError && starkProfile?.profilePicture ? (
              <img
                src={starkProfile.profilePicture}
                className="mr-2 h-8 w-8 rounded-full"
                alt="starknet profile"
                onError={() => {
                  setImageError(true);
                }}
              />
            ) : (
              <img src={blo(address)} className="mr-2 h-8 w-8 rounded-full" />
            )}
            {starkProfile?.name
              ? starkProfile.name
              : address?.slice(0, 6).concat("...").concat(address?.slice(-5))}
          </span>
    </>
  );
};

export default AddressBar