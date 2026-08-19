# EvidenceQuorum Rejection Audit

## What reviewers were able to verify

The public repository at `https://github.com/farzad-eth/evidencequorum` contains only four files: `index.html`, `index.js`, `index.css`, and `vercel.json`. It is a flattened static deployment bundle rather than a source repository. Consequently, it does **not** expose the claimed Python Intelligent Contract, its tests, package manifests, deployment files, or a reproducible build command.

The local workspace holds a separate contract package at `/home/ubuntu/genlayer_submission`, including `src/evidence_quorum.py` and two unittest files. That package was never published to the submitted repository. Its existing tests are helpful safety checks but are not yet a complete GenLayer test suite: one inspects source text and the other duplicates the equivalence predicate instead of importing and executing the contract through a GenLayer-compatible harness.

The deployed website is likewise not a live dApp. Its `Home.tsx` interaction handlers only mutate React state: `prepareDossier`, `runLocalPreview`, and `challengeDossier` never make a network request, call a wallet, or invoke the deployed contract. The UI itself labels those flows as local previews. The current dependency manifest does not include `genlayer-js` or a browser wallet integration.

## Required repair

The corrected public repository must publish a unified, source-buildable project containing the contract package, frontend source, dependency manifests, a lockfile, build scripts, test scripts, deployment configuration, and documentation mapping the UI to the contract's deployed methods.

The contract package must provide the deployable `EvidenceQuorum` Python source and tests that exercise `attest`, `get_attestation`, `get_sources`, `challenge`, and `count`. Contract-level tests must use the GenLayer Testing Suite where feasible, with mocked web/LLM responses for deterministic direct-mode execution and a documented Studio integration command for real-network validation.

During repair, the current Direct Mode runner initially selected a GenVM release whose `genvm-universal` archive is no longer published. The test suite is therefore pinned explicitly to the still-published `v0.2.16` universal runtime. The repaired direct tests now deploy the actual contract in memory, mock both source rendering and adjudication, write an attestation, re-read its record and source snapshot, challenge it, and exercise validation failures.

The frontend must create a GenLayer read client to call `count`, `get_attestation`, and `get_sources` against `0xec5BB6E6f7B950914d55D34d931e0032935c8e89`. It must create a separate wallet-backed write client for `attest` and `challenge`, call `connect("studionet")` before writing, display the returned transaction hash, wait for an acceptance or finalization receipt, check the execution result, and refresh the canonical state. Local preflight validation may remain, but it must be clearly secondary to live contract reads and writes.

## Acceptance criterion for a corrected submission

A reviewer should be able to clone the repository, install dependencies, run contract tests and frontend checks, inspect the exact deployed contract source, see the UI-to-method mapping, read live contract state without a wallet, and initiate an explicit wallet-confirmed write that returns a real GenLayer transaction hash. The app must never present local state as an on-chain attestation.

## Publication note

The repository’s existing GitHub Actions token can commit regular source files but cannot create or update workflow files. The public repair will therefore ship the complete contract, test, build, deployment, and client source package without the optional CI workflow. The test commands and build commands remain documented and were executed locally before publication.
