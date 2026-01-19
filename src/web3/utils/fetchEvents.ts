import { RpcProvider, Contract, constants, hash, events, CallData, num, createAbiParser, Abi, EmittedEvent, ParsedStruct } from 'starknet';
import { getNodeUrl } from "./network";

// Lazy provider getter to ensure correct RPC URL
function getProvider() {
  return new RpcProvider({ nodeUrl: getNodeUrl() });
}


export async function fetchEvents(fromBlock: number, toBlock: number, contractAddr: string, filter: string[][], eventName: string): Promise<[ParsedStruct[], string[]]>{
    const provider = getProvider();
    const lastBlock = await provider.getBlockNumber()
    const keyFilter = [[num.toHex(hash.starknetKeccak('Add'))]];
    let allEvents: any[] = []
    let continuationToken = '0';
    while (continuationToken != undefined) {
        const eventsList = await provider.getEvents({
            address: contractAddr,
            from_block: { block_number: fromBlock },
            to_block: { block_number: toBlock },
            keys: filter,
            chunk_size: 1000,
            continuation_token: continuationToken === '0' ? undefined : continuationToken,
        });
        continuationToken = eventsList.continuation_token!;
        allEvents = allEvents.concat(eventsList.events)
    }

    const contractAbi = await loadAbi(contractAddr);
    const abiEvents = events.getAbiEvents(contractAbi);
    const abiStructs = CallData.getAbiStruct(contractAbi);
    const abiEnums = CallData.getAbiEnum(contractAbi);
    const parser = createAbiParser(contractAbi);
    const parsed = events.parseEvents(allEvents, abiEvents, abiStructs, abiEnums, parser);
    let tx_hash = allEvents.map((e)=> e.transaction_hash)
    return [parsed.map((e) => e[eventName]), tx_hash]
}

export async function loadAbi(contractAddr: string) {
    const provider = getProvider();
    const klass = await provider.getClassAt(contractAddr);
    let abi = klass?.abi;
    if (typeof abi === 'string') {
        abi = JSON.parse(abi) as Abi;
    }
    if (!Array.isArray(abi)) {
        throw new Error('ABI not array for ' + contractAddr);
    }
    return abi;
}

export async function getBlockNumberByTimestamp(
  targetTimestamp: number
): Promise<number> {
  const provider = getProvider();
  const latestBlock = await provider.getBlock("latest");

  let low = 0;
  let high = latestBlock.block_number;
  let result = high;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const block = await provider.getBlock(mid);

    if (block.timestamp >= targetTimestamp) {
      result = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }

  return result;
}

