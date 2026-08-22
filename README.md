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
| [`docs/FINAL_GENLAYER_COMPLIANCE_AUDIT.md`](docs/FINAL_GENLAYER_COMPLIANCE_AUDIT.md) | Official-docs crosswalk, public verification results, and accurately stated reviewer-risk disclosures. |

## Contract methods

| Method | Type | Purpose |
|---|---|---|
| `attest(claim, sources)` | write | Renders 2–8 distinct HTTPS sources, requires evidence-grounded leader/validator agreement, and stores a durable attestation plus immutable bounded evidence captures. |
| `get_attestation(claim_id)` | view | Returns the canonical decision record. |
| `get_evidence(claim_id)` | view | Returns the immutable bounded source captures, direct quotations, and material stances bound to the record. |
| `get_sources(claim_id)` | view | Compatibility view returning the source URLs bound to the record. |
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

## Deployment status

The evidence-bound EvidenceQuorum source is finalized on GenLayer Studio at [`0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8`](https://explorer-studio.genlayer.com/address/0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8). Deployment transaction [`0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f`](https://explorer-studio.genlayer.com/tx/0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f) finalized with successful GenVM execution and accepted consensus. A browser wallet is required only for `attest` and `challenge`; all view calls use a separate unauthenticated GenLayerJS read client.

The prior URL-only deployment at `0xec5BB6E6f7B950914d55D34d931e0032935c8e89` is retained only as historical provenance and must not be presented as implementing this evidence-bound revision.

## Development safeguards

The Direct Mode suite uses deterministic web and LLM mocks. It includes semantic rejection cases where validators independently observe irrelevant or contradicting evidence, plus a fabricated-citation case. The client distinguishes packet validation from a submitted transaction, shows every returned transaction hash, waits for an accepted receipt, checks the execution result, and re-reads canonical state. See [`docs/CONTRACT_INTERFACE.md`](docs/CONTRACT_INTERFACE.md) for the complete interface mapping.

## Security and reproducibility

Read [`SECURITY.md`](SECURITY.md) before integrating the public write methods, and see [`SECURITY_AUDIT_2026-08.md`](SECURITY_AUDIT_2026-08.md) for the pre-submission review, known design limitations, and verification results.
