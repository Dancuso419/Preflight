import assert from "node:assert/strict";
import { verifyContract } from "./contractVerifier";

const ADDR   = "0xDeAdBeEf00000000000000000000000000000001";
const BYTECODE = "0x608060405234801561001057600080fd5b50";

// fake bytecode fetcher — (address, network) => bytecode string
const hasBytecode  = async (_a: string, _n: string) => BYTECODE;
const noBytecode   = async (_a: string, _n: string) => "0x";
const rpcFails     = async (_a: string, _n: string): Promise<string> => { throw new Error("ECONNREFUSED"); };

// capture which network the fetcher was called with
const trackNetwork = (bytecode: string) => {
  let called = "";
  const fetcher = async (_a: string, n: string) => { called = n; return bytecode; };
  return { fetcher, getNetwork: () => called };
};

(async () => {
  // 1 — contract with bytecode → deployed: true
  {
    const r = await verifyContract(ADDR, "testnet", hasBytecode);
    assert.equal(r.deployed, true);
  }

  // 2 — address with "0x" (EOA or undeployed) → deployed: false
  {
    const r = await verifyContract(ADDR, "testnet", noBytecode);
    assert.equal(r.deployed, false);
  }

  // 3 — result echoes back address and network
  {
    const r = await verifyContract(ADDR, "testnet", hasBytecode);
    assert.equal(r.address, ADDR);
    assert.equal(r.network, "testnet");
  }

  // 4 — mainnet network passed through to fetcher
  {
    const { fetcher, getNetwork } = trackNetwork(BYTECODE);
    await verifyContract(ADDR, "mainnet", fetcher);
    assert.equal(getNetwork(), "mainnet");
  }

  // 5 — testnet network passed through to fetcher
  {
    const { fetcher, getNetwork } = trackNetwork(BYTECODE);
    await verifyContract(ADDR, "testnet", fetcher);
    assert.equal(getNetwork(), "testnet");
  }

  // 6 — invalid address (not 0x + 40 hex) → throws
  {
    try {
      await verifyContract("not-an-address", "testnet", hasBytecode);
      assert.fail("should have thrown");
    } catch (e: any) {
      assert.ok(e.message.includes("Invalid address"), `got: ${e.message}`);
    }
  }

  // 7 — RPC failure → deployed: false, does not throw
  {
    const r = await verifyContract(ADDR, "testnet", rpcFails);
    assert.equal(r.deployed, false);
    assert.equal(r.network, "testnet");
  }

  console.log("contractVerifier: all tests passed");
})().catch((e) => { console.error(e); process.exit(1); });
