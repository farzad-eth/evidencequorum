# EvidenceQuorum: Evidence-Grounded Consensus Remediation

## Purpose

This document responds to the second reviewer rejection. It is a **proposed engineering change**, not an implementation or a claim that the deployed contract already provides the safeguards described below.

> The reviewer identified a substantive consensus flaw: a validator can currently accept a leader result solely because its payload is well formed. The validator does not independently assess whether the bounded sources support or refute the claim, and the stored record binds only URLs rather than the evidence content observed during the decision.

The current implementation confirms this finding. Its validator delegates to `validate_attestation_payload`, which enforces schema, enums, bounds, and rationale length but does not fetch sources or derive a competing decision. This is precisely the leader-output-only validation pattern that GenLayer explicitly warns is not consensus.[1]

## Current Gap

| Requirement | Current behavior | Required remediation |
|---|---|---|
| Independent evidence assessment | Validators check payload structure only. | Each validator fetches the same bounded URLs, independently classifies the claim against the fetched evidence, and compares stable decision fields with the leader’s result. |
| Evidence provenance | Records retain URLs only. A URL may change after attestation. | Append a bounded, normalized immutable capture for each source to the record, together with the URL and the exact quoted passage used for the decision. |
| Semantic equivalence | `SUPPORTED` or `REFUTED` is accepted when source count is at least two. | Require validator and leader agreement on the decision status and the source identifiers that materially support or refute the proposition. Do not compare prose rationale word-for-word. |
| Negative coverage | Direct Mode covers a success case and shape acceptance. | Add explicit validator-disagreement tests for unrelated, altered, unavailable, or semantically unsupported evidence. |

## Proposed Contract Design

### 1. Bounded immutable evidence snapshots

The contract will replace the URL-only `sources_by_claim` storage with append-only `EvidenceSnapshot` records. Every accepted attestation will store, per source, the original HTTPS URL, a normalized bounded text capture, and the material quotation cited by the adjudication. The snapshot is the immutable evidence content bound to that claim revision; it is not a claim that the remote URL can never change.

The exact storage shape will be verified against the deployed GenVM runtime during implementation, but its intended semantic surface is:

```python
@allow_storage
@dataclass
class EvidenceSnapshot:
    url: str
    captured_text: str       # bounded normalized source content
    material_quote: str      # direct substring of captured_text
    stance: str              # SUPPORTS or REFUTES
```

The contract will also expose `get_evidence(claim_id)` so builders can inspect the immutable, on-chain source captures and material quotes rather than only current URLs. `get_sources(claim_id)` will remain as a compatibility view derived from stored snapshots.

To keep writes bounded, a source capture will use a strict maximum text length, a maximum of eight sources, and a maximum quote length. Duplicate URLs, non-HTTPS URLs, blank captures, and evidence that cannot yield a bounded capture will be rejected before a record is written.

### 2. Leader and validator each assess bounded evidence

The leader’s non-deterministic function will render each supplied URL into a bounded text capture, then return a structured decision containing the immutable captures and source-specific evidence references. It will be instructed to use only those captures and to select `INCONCLUSIVE` whenever evidence is missing, conflicting, unavailable, or does not materially resolve the claim.

The validator function will **not** trust that leader payload merely because it is formatted correctly. It will independently render the same URLs, independently derive a structured decision from its own bounded evidence, validate its own citations, and compare the stable fields below:

| Decision field | Required comparison |
|---|---|
| `status` | Exact match between leader and validator. |
| Material source identifiers | Exact set match for a binary `SUPPORTED` or `REFUTED` outcome. |
| Source stance | Exact match: every cited source must be classified consistently as supporting or refuting. |
| Citations | Every leader and validator material quote must be a bounded direct substring of that node’s captured source text. |
| Confidence and rationale | Individually range/length checked, but not compared word-for-word. |

The leader result will be rejected if the validator’s independently fetched evidence produces a different status, a different material-source set, or invalid citations. The only accepted binary outcomes will have at least two distinct sources whose captured text materially supports **or** materially refutes the claim. Conflicting evidence, source-fetch failures, content too short to assess, and non-material citations will resolve conservatively to `INCONCLUSIVE` or fail the transaction before state is written.

This follows GenLayer’s documented custom-validator pattern: validators must use evidence other than the leader answer alone, commonly by rerunning the same web/LLM task and comparing stable decision fields.[1] GenLayer also specifically notes that source-grounded non-comparative validation still requires validators to read the same source data and judge the leader against explicit criteria; a schema check alone is insufficient.[1]

### 3. Immutable binding and claim history

The append-only record will retain the decision, the claim, the source captures, the citations, and the challenge state. A `challenge` will continue to mark the record without altering its evidence capture. A later attestation of a changed source set will create a new record and new immutable snapshot; it will never replace the evidence content of an earlier claim.

Because this redesign changes persisted state and adds an evidence view, it requires a **new contract deployment**. The frontend’s configured address and all public documentation will be updated only after the new implementation has passed its tests and the deployment is verified.

## Proposed Test Matrix

| Test | Leader evidence | Validator evidence | Expected result |
|---|---|---|---|
| Supported claim accepted | Two source captures directly support the claim. | Independently fetched captures also support it. | Validator agrees; a record stores the immutable captures and quotes. |
| Refuted claim accepted | Two source captures directly contradict the claim. | Independent captures also refute it. | Validator agrees; `REFUTED` record is written. |
| Well-formed but unsupported payload rejected | Leader reports `SUPPORTED` with valid fields. | Validator evidence is unrelated or inconclusive. | `run_validator()` returns `False`; no record is committed. |
| Altered-source disagreement rejected | Leader observes support. | Validator fetch observes conflicting or altered material. | Validator rejects the leader decision. |
| Unavailable or too-short source rejected | Capture is blank, inaccessible, or below the minimum evidence length. | Same failure or independent non-material content. | Transaction is not accepted as a binary attestation. |
| Fabricated quotation rejected | Leader payload includes a quote not present in its stored capture. | Validator validates citation inclusion. | Validator rejects the payload. |
| Immutable evidence preserved | A record is accepted and then challenged. | N/A | `get_evidence` returns the original stored captures and quotes unchanged. |

Direct Mode will use `mock_web`, `mock_llm`, `strict_mocks`, and `run_validator()` with swapped validator mocks. GenLayer’s testing guidance specifically recommends this pattern to confirm that validators disagree when evidence is ambiguous or differs from the leader’s environment.[2]

## Public-Facing and Deployment Changes

The React client will be adjusted to read and display the immutable evidence snapshots and citations returned by the new deployment. Its existing wallet-backed `attest` and `challenge` write paths will be retained, but its copy will no longer describe URL storage as an immutable source snapshot. The README, interface mapping, security note, and submission description will be revised to distinguish a captured evidence snapshot from a live URL.

The implementation will be tested locally, deployed as a new Studio contract, verified through both the client and Explorer, and published with the complete test suite before any fresh portal resubmission is considered.

## Approval Requested

Approval is requested to implement the redesign above, including the breaking new deployment, the contract/client/documentation changes, and the expanded semantic rejection test suite. No portal action or resubmission is included in this approval request.

## References

[1]: https://docs.genlayer.com/developers/intelligent-contracts/equivalence-principle "GenLayer: The Equivalence Principle"
[2]: https://docs.genlayer.com/developers/intelligent-contracts/testing "GenLayer: Testing Intelligent Contracts"
[3]: https://docs.genlayer.com/developers/intelligent-contracts/examples/fetch-web-content "GenLayer: FetchWebContent Contract"
[4]: https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/optimistic-democracy/equivalence-principle "GenLayer: Equivalence Principle Mechanism"
