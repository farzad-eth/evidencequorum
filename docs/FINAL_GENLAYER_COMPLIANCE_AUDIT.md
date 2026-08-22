# Final GenLayer Compliance Audit

**Audit date:** 22 August 2026

> **Conclusion:** The final source, Studio deployment, and production client satisfy the current GenLayer requirements reviewed below and directly address both reviewer rejections. This audit does not claim that web sources are permanently immutable or that any LLM judgment is guaranteed true; it documents the contract’s bounded evidence, independent validator assessment, and consensus safeguards.

## Official documentation rechecked

| Topic | Official source | EvidenceQuorum alignment |
|---|---|---|
| Contract structure | [Introduction](https://docs.genlayer.com/developers/intelligent-contracts/introduction) | Typed Python `gl.Contract` state and explicit public view/write methods. |
| Equivalence | [Equivalence Principle](https://docs.genlayer.com/understand-genlayer-protocol/core-concepts/optimistic-democracy/equivalence-principle) | A derived decision signature compares status plus material source/stance, instead of volatile raw outputs. |
| LLM execution | [Calling LLMs](https://docs.genlayer.com/developers/intelligent-contracts/features/calling-llms) | `run_nondet_unsafe`, structured JSON, and explicit validation of shape and evidence binding. |
| Web access | [Web Access](https://docs.genlayer.com/developers/intelligent-contracts/features/web-access) | Leader and validators independently render bounded sources and compare stable derived fields. |
| Testing | [Testing](https://docs.genlayer.com/developers/intelligent-contracts/testing) and [Direct Mode](https://docs.genlayer.com/api-references/genlayer-test/direct) | Deterministic web/LLM mocks and changed-mock `run_validator()` disagreement tests. |
| Studio deployment | [Deploy Contracts](https://docs.genlayer.com/developers/intelligent-contracts/tools/genlayer-studio/deploying-contract) | Final deployed source and schema-derived method surface are publicly visible in Explorer. |
| DApp calls | [GenLayerJS Contract Methods](https://docs.genlayer.com/api-references/genlayer-js/contracts) | Public `readContract` views and explicit wallet-backed `writeContract` state changes. |

## Independently verified evidence

| Artifact | Verified finding |
|---|---|
| Published source | `contracts/evidence_quorum.py`, seven Direct Mode tests, Studio smoke test, client, manifests, interface documentation, and security documentation are publicly readable. |
| Studio contract | [`0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8`](https://explorer-studio.genlayer.com/address/0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8) has deploy transaction [`0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f`](https://explorer-studio.genlayer.com/tx/0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f), finalized with successful GenVM execution and accepted consensus. |
| Production client | [eq-proof.vercel.app](https://eq-proof.vercel.app/) names `0x11B…dbC8`, shows seven Direct Mode tests, and live-reads zero canonical records from the finalized contract. |
| Fresh reproduction | A fresh public clone passed all seven Direct Mode tests; the published probe returned the final address and `count: 0`; TypeScript and the production build completed successfully. A bounded `pnpm audit --prod --json` returned zero advisories across 230 production dependencies. |

## Evidence and consensus design

`attest` runs the leader assessment within `run_nondet_unsafe`. Its validator independently renders and assesses the supplied 2–8 HTTPS sources, validates each cited quotation against its own bounded capture, and accepts only when the validated decision status plus material source/stance signature matches. The accepted record persists the leader-observed URL, bounded normalized capture, direct quote, and stance as immutable JSON through `get_evidence(claim_id)`.

The seven Direct Mode tests cover supported/refuted acceptance, irrelevant-evidence and contradictory-evidence validator disagreement, fabricated quote rejection, immutable evidence preservation after challenge, and input bounds. The Studio integration test is deliberately a deployment-and-view smoke test; it does not claim to create a public live-source attestation.

## Reviewer-risk disclosures

| Topic | Accurate interpretation |
|---|---|
| Changed-mock validator test | `direct_vm.run_validator()` replays the captured validator with replacement mocks. It proves semantic disagreement rejection, but does not commit a failed transaction, so it is not presented as a post-rejection state test. |
| Strict mock and pickle checks | `strict_mocks` and `check_pickling` are recommended testing hygiene options that are not currently enabled. This is a non-blocking improvement opportunity, not a claim that those checks ran. |
| Source immutability | The contract preserves a bounded leader-observed on-chain snapshot. It is not a cryptographic content-addressed archive; source URLs may change and validators may observe non-identical raw pages. |
| Consensus equivalence | Nodes compare a conservative derived decision/material-source signature rather than byte-identical captured text or LLM prose, consistent with the guidance for independently fetched web data. |

## Reviewer path

1. Read the [README](../README.md) and [contract interface map](CONTRACT_INTERFACE.md).
2. Inspect [contract source](https://github.com/farzad-eth/evidencequorum/blob/main/contracts/evidence_quorum.py) and [Direct Mode tests](https://github.com/farzad-eth/evidencequorum/blob/main/tests/direct/test_evidence_quorum.py).
3. Inspect the finalized [Studio Explorer contract](https://explorer-studio.genlayer.com/address/0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8).
4. Open [eq-proof.vercel.app](https://eq-proof.vercel.app/) for a live canonical read and the explicit wallet-write path.
