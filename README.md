# EvidenceQuorum

EvidenceQuorum is a complete GenLayer application for source-grounded, challengeable evidence attestations. It combines a reusable Python Intelligent Contract with a React/Vite client that reads canonical state and initiates explicit browser-wallet writes against the deployed contract.

> The application does not treat an LLM response or local form state as an on-chain result. A canonical attestation exists only after GenLayer accepts the `attest` transaction and the client reads the stored record back from the contract.

## Repository layout

| Path | Purpose |
|---|---|
| [`contracts/evidence_quorum.py`](contracts/evidence_quorum.py) | Complete deployable GenLayer Intelligent Contract. |
| [`tests/direct`](tests/direct) | Fast Direct Mode contract tests with mocked web and LLM responses. |
| [`tests/integration`](tests/integration) | Studio deployment smoke test. |
| [`deploy/001_deploy_evidence_quorum.ts`](deploy/001_deploy_evidence_quorum.ts) | Reproducible GenLayer CLI deploy script. |
| [`client`](client) | React/Vite evidence-dossier app with GenLayerJS read and wallet-write paths. |
| [`docs/CONTRACT_INTERFACE.md`](docs/CONTRACT_INTERFACE.md) | Exact mapping between UI actions and contract methods. |

## Contract methods

| Method | Type | Purpose |
|---|---|---|
| `attest(claim, sources)` | write | Renders 2–8 HTTPS sources, reaches constrained validator consensus, and stores a durable attestation. |
| `get_attestation(claim_id)` | view | Returns the canonical decision record. |
| `get_sources(claim_id)` | view | Returns the source snapshot bound to the record. |
| `challenge(claim_id)` | write | Preserves history while marking an existing record as challenged. |
| `count()` | view | Returns the current number of attestations. |

## Run and verify

Python 3.12+ and Node.js 18+ are required.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Fast in-memory contract tests; no Studio required.
pytest tests/direct/ -v

# Optional Studio integration test; requires GenLayer Studio.
gltest tests/integration/ -v -s

# Deploy the contract through the GenLayer CLI.
genlayer deploy

# Start the React client. The deployed Studio contract address is the documented
# default; override it with VITE_EVIDENCEQUORUM_CONTRACT_ADDRESS when needed.
pnpm install --frozen-lockfile
pnpm dev
```

## Deployed Studio contract

The showcase defaults to the deployed Studio address [`0xec5BB6E6f7B950914d55D34d931e0032935c8e89`](https://explorer-studio.genlayer.com/address/0xec5BB6E6f7B950914d55D34d931e0032935c8e89). A browser wallet is required only for `attest` and `challenge`; all view calls use a separate unauthenticated GenLayerJS read client.

## Development safeguards

The direct tests use deterministic web and LLM mocks. The client distinguishes packet validation from a submitted transaction, shows every returned transaction hash, waits for an accepted receipt, checks the execution result, and re-reads canonical state. See [`docs/CONTRACT_INTERFACE.md`](docs/CONTRACT_INTERFACE.md) for the complete interface mapping.
