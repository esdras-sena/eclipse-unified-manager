import { useReadContract} from "@starknet-react/core";
import Erc20Abi from "./token.abi.json";
import { formatCurrency } from "./helpers";
import { Abi } from "starknet";

type Props = {
  address: string;
  heading?: boolean;
};

function AccountBalance({ address, heading = true }: Props) {
  const { data: eth, isLoading: ethLoading } = useReadContract({
    address: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
    abi: Erc20Abi as Abi,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  const { data: strk, isLoading: strkLoading } = useReadContract({
    address: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
    abi: Erc20Abi as Abi,
    functionName: "balanceOf",
    args: [address!],
    watch: true,
  });

  // @ts-ignore
  const ethBalance = formatCurrency(eth?.balance.low.toString());
  // @ts-ignore
  const strkBalance = formatCurrency(strk?.balance?.low.toString());

  return (
    <div className="p-3 text-sm bg-card border border-border rounded-md">
      {heading && <h3 className="mb-4 text-sm text-muted-foreground">Assets</h3>}

      <div className="flex flex-col gap-4 text-card-foreground">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-7 w-7 rounded-full md:h-9 md:w-9">
              <img className="w-full" src="/assets/eth.svg" alt="" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">ETH</p>
              <p className="text-xs text-muted-foreground">Ethereum</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p className="font-mono">{Number(ethBalance).toFixed(3)}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <div className="h-7 w-7 rounded-full md:h-9 md:w-9">
              <img className="w-full" src="/assets/strk.svg" alt="" />
            </div>
            <div>
              <p className="mb-1 text-sm font-medium">STRK</p>
              <p className="text-xs text-muted-foreground">Starknet token</p>
            </div>
          </div>
          <div className="mr-4 flex items-center">
            <p className="font-mono">{Number(strkBalance).toFixed(3)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AccountBalance;