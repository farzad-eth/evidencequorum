/**
 * EvidenceQuorum deployment script.
 * Run `genlayer deploy` after selecting a Studio or testnet network.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import type { DecodedDeployData, GenLayerChain, GenLayerClient, TransactionHash } from "genlayer-js/types";
import { TransactionStatus } from "genlayer-js/types";

export default async function deployEvidenceQuorum(client: GenLayerClient<any>) {
  const contractPath = path.resolve(process.cwd(), "contracts/evidence_quorum.py");
  const code = new Uint8Array(readFileSync(contractPath));

  await client.initializeConsensusSmartContract();
  const hash = await client.deployContract({ code, args: [] });
  const receipt = await client.waitForTransactionReceipt({
    hash: hash as TransactionHash,
    status: TransactionStatus.ACCEPTED,
    retries: 200,
  });

  if (receipt.statusName !== TransactionStatus.ACCEPTED && receipt.statusName !== TransactionStatus.FINALIZED) {
    throw new Error(`EvidenceQuorum deployment was not accepted: ${JSON.stringify(receipt)}`);
  }

  const chain = client.chain as GenLayerChain;
  const deployedAddress = chain.name === "testnetBradbury"
    ? (receipt.txDataDecoded as DecodedDeployData | undefined)?.contractAddress
    : receipt.data?.contract_address;

  console.log("EvidenceQuorum deployed", { hash, deployedAddress });
  return deployedAddress;
}

