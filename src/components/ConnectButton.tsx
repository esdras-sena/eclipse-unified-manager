import Chevron from "../assets/icons/chevron.svg";
import Warning from "../assets/icons/warning.svg";
import type { CSSProperties } from "react";
import styled from "styled-components";
import { Connector, useAccount, useConnect, useDisconnect, useStarkProfile, useNetwork } from "@starknet-react/core";
import { useStarknetkitConnectModal } from "starknetkit";
import AddressBar from "./lib/AddressIcon";
import GenericModal from "./lib/GenericModal";
import Close from "../svg/Close";
import { blo } from 'blo';
import CopyButton from "./lib/CopyButton";
import Blockies from "react-blockies";
import AccountBalance from "./lib/AccountBalance";
import { useEffect, useState } from "react";

const UserModal = () => {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { chain } = useNetwork();

  const { disconnect } = useDisconnect();
  const [imageError, setImageError] = useState(false);
  const { data: starkProfile } = useStarkProfile({
    address,
  });

  return (
    <GenericModal
      popoverId="user-popover"
    // style={{ position: "fixed", inset: 0, zIndex: 1000 }}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60"
        onClick={() => {
          const popover = document.getElementById("user-popover");
          // @ts-ignore
          popover?.hidePopover?.();
        }}
      />
      {/* Card */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="pointer-events-auto mx-auto mt-12 md:mt-16 w-[92vw] max-w-[32rem] rounded-[16px] border border-border bg-black p-5 text-card-foreground shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">Connected</h3>
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-label="Wallet connected" />
              <span className="ml-2 inline-flex items-center rounded-full border border-border bg-muted/40 px-2 py-0.5 text-xs text-muted-foreground">
                {mounted ? ((() => {
                  let hint = '';
                  try { hint = (localStorage.getItem('preferredChain') || '').toLowerCase(); } catch { }
                  if (hint.includes('main')) return 'Starknet';
                  if (hint.includes('sepolia')) return 'Starknet Sepolia Testnet';
                  return chain?.name || 'Network';
                })()) : 'Network'}
              </span>
            </div>
            <button
              className="grid h-8 w-8 place-content-center rounded-full hover:bg-muted"
              onClick={() => {
                const pop = document.getElementById("user-popover");
                // @ts-ignore
                pop?.hidePopover?.();
              }}
            >
              <Close />
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-9 w-9 overflow-clip rounded-full md:h-10 md:w-10">
              {!imageError && starkProfile?.profilePicture ? (
                <img
                  src={starkProfile?.profilePicture}
                  className="w-full rounded-full"
                  alt="starknet profile"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Blockies seed={address || ""} scale={8} className="mx-auto h-full w-full rounded-full" />
              )}
            </div>
            <CopyButton
              copyText={starkProfile?.name || address || ""}
              buttonText={
                starkProfile?.name || address?.slice(0, 10).concat("...").concat(address?.slice(-5))
              }
              className="flex items-center gap-2 text-sm text-card-foreground/90 hover:text-card-foreground"
              iconClassName="text-accent"
            />
          </div>

          <div className="mt-4">
            <h4 className="mb-2 text-sm text-muted-foreground">Assets</h4>
            <AccountBalance address={address || ""} heading={false} />
          </div>

          <div className="mt-4">
            <button
              onClick={() => {
                const popover = document.getElementById("user-popover");
                // @ts-ignore
                popover?.hidePopover?.();
                disconnect();
              }}
              className="w-full rounded-[10px] border border-border bg-muted p-2.5 text-red-400 hover:bg-muted/70"
            >
              Disconnect
            </button>
          </div>
        </div>
      </div>
    </GenericModal>
  );
};

export function ConnectButton() {
  const { isConnected } = useAccount()
  const { connect, connectors, connector } = useConnect();
  const [open, setOpen] = useState(false);

  const connectWallet = async () => {
    const { starknetkitConnectModal } = useStarknetkitConnectModal({
      connectors: connectors as any
    })

    const { connector: rawConnector } = await starknetkitConnectModal();
    const connector = rawConnector ?? undefined;
    await connect({ connector })
  }

  const WalletButton = styled.button`
    background: none;
    display: flex;
    gap: 15px;
  `;

  const WalletButtonPrimaryWrapper = styled(Wrapper)`
  color: var(--white);
  background-color: var(--red-500);
  &:hover {
    background-color: var(--red-600);
  }
`;

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
    <Wrapper >
      {(() => {
        if (!isConnected) {

          return (
            <Button style={connectButtonStyle} onClick={async () => {
              await connectWallet()
            }}>
              Connect wallet
            </Button>
          );
        }

        return (
          <>
            <Button
              onClick={() => togglePopover({ targetId: "user-popover" })}
              style={
                {
                  "--justify-content": "space-between",
                  "--background": "var(--blue-grey-600)",
                } as CSSProperties
              }
            >
              <div style={{
                color: "inherit",
                display: "flex",
                gap: "20px",
              }}>
                <AddressBar />
              </div>
              <img src={Chevron} alt="chevron" />
            </Button>
            <UserModal />
          </>
        );
      })()}
    </Wrapper>
  );


}

const connectButtonStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "var(--justify-content, center)",
  height: "45px",
  minWidth: "190px",
  width: "100%",
  paddingInline: "20px",
  borderRadius: "4px",
  font: "var(--body-sm)",
  color: "#ffffff",
  backgroundColor: "#ff4d4f",
  transition: "filter var(--animation-duration)",
}

const Wrapper = styled.div`
  pointer-events: var(--pointer-events);
  user-select: var(--user-select);
`;


const ButtonInnerWrapper = styled.div`
  color: inherit;
  display: flex;
  gap: 20px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: var(--justify-content, center);
  height: 45px;
  min-width: 190px;
  width: 100%;
  padding-inline: 20px;
  border-radius: 4px;
  font: var(--body-sm);
  color: var(--white);
  background: var(--background, var(--red-500));
  transition: filter var(--animation-duration);

  &:hover {
    filter: brightness(1.2);
  }
`;

const WrongNetworkButton = styled(Button)`
  gap: 8px;
`;

const ChevronIcon = styled(Chevron)``;

const WarningIcon = styled(Warning)`
  width: 16px;
  path {
    fill: var(--white);
    stroke: var(--red-500);
  }
`;
