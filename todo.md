# EvidenceQuorum rejection repair

## Audit

- [x] Verify whether the submitted GitHub repository contains the complete Intelligent Contract source, tests, build files, and deployment documentation.
- [x] Compare the deployed contract address and method surface with the repository contents.
- [x] Identify why the website currently performs only local preview state changes.

## Contract package

- [x] Add or restore the complete contract source in the repository with its typed storage and consensus methods.
- [x] Add reproducible GenLayer Direct Mode tests, dependency/build files, deployment script, CI, and run instructions.
- [x] Document the deployed address and exact callable methods.

## Client integration

- [x] Implement and verify a real read path from the deployed contract; the public `count()` view returns `0` from the configured Studio address.
- [x] Implement a wallet-backed write path for `attest` and `challenge`, with acceptance receipt handling and canonical-state refreshes.
- [x] Remove local consensus preview controls; preflight is now explicitly non-canonical.

## Verification and resubmission

- [x] Run Direct Mode tests, TypeScript checks, production build, and a GenLayerJS live-read probe.
- [x] Publish the prepared repaired source tree to `farzad-eth/evidencequorum` through the authenticated GitHub browser session. Workflow run `#2` completed successfully after omitting the restricted CI workflow file.
- [ ] Diagnose and correct the failed first run of the browser-authorized one-time GitHub Actions publication workflow before re-running it.
- [ ] Rebuild the publication archive without `.github/workflows/verify.yml`; the GitHub Actions token may write source files but is not authorized to create or update workflow files.
- [x] Verify the corrected workflow-free source publication run (`#2`) succeeds and the flattened repository is replaced by the complete project tree.
- [ ] If run `#2` remains queued, inspect GitHub Actions availability or use the authenticated browser to publish an alternate verified archive path.
- [ ] GitHub Actions run `#2` is still queued after repeated checks; determine whether repository Actions execution is restricted before relying on it for publication.
- [x] Confirm repository Actions are enabled. The default token setting is read-only, while the one-time workflow explicitly requests `contents: write`; no settings change was made because this does not grant the separate workflow-file permission that caused run `#1` to fail.
- [ ] Verify the existing Vercel project rebuilds from the newly published Vite source and serves the live GenLayer read client at `eq-proof.vercel.app`.
- [ ] Diagnose the Vercel Error deployment created by the published full-source commit, repair its build configuration, and verify the production alias updates safely.
- [x] Restore the missing `patches/wouter@3.7.1.patch` file referenced by the published `pnpm` configuration (commit `c3b170a`).
- [ ] Verify the Vercel deployment triggered by `c3b170a` completes the frozen dependency install and production build.
- [x] Verify the Vercel deployment triggered by `c3b170a` completes the frozen dependency install and production build; production is Ready.
- [ ] Verify `eq-proof.vercel.app` shows the real GenLayer read state and explicit wallet-backed write actions in the deployed client.
- [x] Verify `eq-proof.vercel.app` shows the real GenLayer read state and explicit wallet-backed write actions in the deployed client. Browser verification returned 0 canonical records from the live contract.
- [ ] Prepare a corrected portal submission and require user approval before any final submission action.

## Pre-resubmission security and reproducibility audit

- [ ] Inventory all files, public URLs, GitHub Actions records, and Vercel settings exposed by the repaired project.
- [ ] Inspect all third-party dependencies, lockfile references, scripts, and patches for unsafe install/build behavior.
- [ ] Review contract authorization, validation boundaries, storage handling, and external-content treatment.
- [ ] Review the web client’s read/write boundary, wallet interaction, input validation, and public configuration.
- [ ] Check the published repository for secrets, credentials, unsafe workflows, and unintended files.
- [ ] Document findings, remediate material risks, and only then ask for resubmission approval.
