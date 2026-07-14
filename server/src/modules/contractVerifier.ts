// TRD 3.4 — Contract Verifier
export interface ContractVerifyResult {
  deployed: boolean;
  network: string;
  address: string;
}

export async function verifyContract(address: string, network: "testnet" | "mainnet"): Promise<ContractVerifyResult> {
  // TODO: query Monad RPC for bytecode via Monskills
  throw new Error("Not implemented");
}
