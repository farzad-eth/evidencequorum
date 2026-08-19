/**
 * Signal Room integration reminder: live contract state is the source of truth.
 * Preflight checks may guide a user, but this module never labels local state as
 * an attestation. Canonical state is always re-read from GenLayer.
 */
import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { ExecutionResult, TransactionStatus } from "genlayer-js/types";

export const EVIDENCEQUORUM_ADDRESS =
  (import.meta.env.VITE_EVIDENCEQUORUM_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  "0xec5BB6E6f7B950914d55D34d931e0032935c8e89";

type WalletRequest = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};

type BrowserWallet = {
  request: (request: WalletRequest) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: BrowserWallet;
  }
}

export type CanonicalAttestation = {
  claimId: string;
  claim: string;
  status: "SUPPORTED" | "REFUTED" | "INCONCLUSIVE";
  confidence: number;
  sourceCount: number;
  rationale: string;
  createdAt: string;
  challenged: boolean;
  revision: number;
  sources: string[];
};

export type LiveContractState = {
  count: number;
  latest: CanonicalAttestation | null;
};

export type ContractWrite = {
  txHash: string;
  walletAddress: string;
};

const readClient = createClient({ chain: studionet });

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "string") return Number(value);
  return Number(value ?? 0);
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object") {
    throw new Error("GenLayer returned an unexpected attestation payload.");
  }
  return value as Record<string, unknown>;
}

function normaliseAttestation(claimId: string, value: unknown, sources: unknown): CanonicalAttestation {
  const record = asRecord(value);
  return {
    claimId,
    claim: String(record.claim ?? ""),
    status: String(record.status ?? "INCONCLUSIVE") as CanonicalAttestation["status"],
    confidence: toNumber(record.confidence),
    sourceCount: toNumber(record.source_count),
    rationale: String(record.rationale ?? ""),
    createdAt: String(record.created_at ?? ""),
    challenged: Boolean(record.challenged),
    revision: toNumber(record.revision),
    sources: Array.isArray(sources) ? sources.map(String) : [],
  };
}

async function walletClient(): Promise<{ client: ReturnType<typeof createClient>; walletAddress: `0x${string}` }> {
  if (!window.ethereum) {
    throw new Error("No browser wallet was found. Install or unlock a wallet to submit a GenLayer transaction.");
  }

  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  const walletAddress = Array.isArray(accounts) ? accounts[0] : undefined;
  if (typeof walletAddress !== "string" || !walletAddress.startsWith("0x")) {
    throw new Error("The wallet did not return a usable account address.");
  }

  const client = createClient({
    chain: studionet,
    account: walletAddress as `0x${string}`,
    provider: window.ethereum as never,
  });
  await client.connect("studionet");
  return { client, walletAddress: walletAddress as `0x${string}` };
}

async function waitForAcceptedWrite(txHash: string): Promise<void> {
  const receipt = await readClient.waitForTransactionReceipt({
    hash: txHash as never,
    status: TransactionStatus.ACCEPTED,
    interval: 3_000,
    retries: 80,
  });

  if (receipt.txExecutionResultName === ExecutionResult.FINISHED_WITH_ERROR) {
    throw new Error("GenLayer accepted the transaction but the contract execution failed. No canonical state was written.");
  }
}

export async function readLiveContractState(): Promise<LiveContractState> {
  const rawCount = await readClient.readContract({
    address: EVIDENCEQUORUM_ADDRESS,
    functionName: "count",
    args: [],
    jsonSafeReturn: true,
  });
  const count = toNumber(rawCount);
  if (count <= 0) return { count: 0, latest: null };

  const claimId = `claim-${count - 1}`;
  const [record, sources] = await Promise.all([
    readClient.readContract({
      address: EVIDENCEQUORUM_ADDRESS,
      functionName: "get_attestation",
      args: [claimId],
      jsonSafeReturn: true,
    }),
    readClient.readContract({
      address: EVIDENCEQUORUM_ADDRESS,
      functionName: "get_sources",
      args: [claimId],
      jsonSafeReturn: true,
    }),
  ]);

  return { count, latest: normaliseAttestation(claimId, record, sources) };
}

export async function submitAttestation(claim: string, sources: string[]): Promise<ContractWrite> {
  const { client, walletAddress } = await walletClient();
  const txHash = await client.writeContract({
    address: EVIDENCEQUORUM_ADDRESS,
    functionName: "attest",
    args: [claim, sources],
    value: BigInt(0),
  });
  await waitForAcceptedWrite(String(txHash));
  return { txHash: String(txHash), walletAddress };
}

export async function submitChallenge(claimId: string): Promise<ContractWrite> {
  const { client, walletAddress } = await walletClient();
  const txHash = await client.writeContract({
    address: EVIDENCEQUORUM_ADDRESS,
    functionName: "challenge",
    args: [claimId],
    value: BigInt(0),
  });
  await waitForAcceptedWrite(String(txHash));
  return { txHash: String(txHash), walletAddress };
}
