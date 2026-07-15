import axios from "axios";

export interface ContractVerifyResult {
  deployed: boolean;
  network: string;
  address: string;
}

export type BytecodeFetcher = (address: string, network: "testnet" | "mainnet") => Promise<string>;

const RPC: Record<"testnet" | "mainnet", string> = {
  testnet: process.env.MONAD_RPC_URL_TESTNET ?? "https://testnet-rpc.monad.xyz",
  mainnet: process.env.MONAD_RPC_URL_MAINNET ?? "https://rpc.monad.xyz",
};

const defaultFetcher: BytecodeFetcher = async (address, network) => {
  const res = await axios.post(RPC[network], {
    jsonrpc: "2.0", id: 1,
    method: "eth_getCode",
    params: [address, "latest"],
  });
  return res.data.result as string;
};

export async function verifyContract(
  address: string,
  network: "testnet" | "mainnet",
  fetcher: BytecodeFetcher = defaultFetcher,
): Promise<ContractVerifyResult> {
  if (!/^0x[0-9a-fA-F]{40}$/.test(address))
    throw new Error(`Invalid address: ${address}`);

  try {
    const bytecode = await fetcher(address, network);
    return { deployed: bytecode !== "0x" && bytecode.length > 2, network, address };
  } catch {
    return { deployed: false, network, address };
  }
}
