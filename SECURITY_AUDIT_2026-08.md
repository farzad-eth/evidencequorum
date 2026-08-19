# EvidenceQuorum Security and Reproducibility Review

**Scope.** This engineering review covered the published GitHub tree, repository history, dependency lockfile, deployment configuration, contract source, Direct Mode tests, and public browser behavior as of August 19, 2026. It is a practical pre-submission review, not a substitute for an independent professional security audit.

## Results

| Area | Result | Action |
|---|---|---|
| Published repository | The original full-source publication omitted the `tests/` directory even though the README referenced it. | **Material reproducibility issue:** tests must be included in the next source publication. |
| Credentials and Git history | No common private-key, GitHub-token, cloud-key, or secret patterns were found; no tracked symlinks or executable artifacts were found. | Keep the current ignore rules and review staged diffs before publishing. |
| GitHub automation | The one-time repair workflow has completed and is not present in the repaired source tree. | Do not add unreviewed workflows; prefer protected commits and short-lived release automation. |
| Vercel surface | The deployed app is a static Vite build. | Removed development telemetry, storage proxy code, and the public debug collector from the local hardened source. |
| JavaScript dependencies | The initial template lockfile reported many advisories in unused server and UI-template packages. | Reduced the project to its actual runtime dependencies; the minimized production audit reports no advisories. |
| Contract and client boundary | Live reads return canonical GenLayer state; writes require an explicit wallet request and receipt check. | Browser-side source validation now also rejects malformed, duplicate, local, and private-network URLs. |
| Contract design limitation | The deployed contract’s source policy is intentionally simple and public writes are permissionless. | Documented the limitation. A hardened v2 should enforce canonical host parsing and duplicate-source policy on-chain before high-stakes deployment. |

## Verification performed

The hardened local source completed a frozen, script-free pnpm installation, `pnpm check`, `pnpm build`, and `pnpm test:contract`. The Direct Mode suite completed five tests covering canonical attestation writes, source snapshots, challenge preservation, input-bound rejects, validator acceptance, and unknown-claim rejects. The public production site separately completed a live `count()` read against the Studio contract and displayed zero canonical records.

## Submission condition

Do not resubmit until the GitHub repository contains this audit record, `SECURITY.md`, and the complete `tests/direct` and `tests/integration` suites. The Vercel site must then be redeployed from that same commit and its submitted URL rechecked.
