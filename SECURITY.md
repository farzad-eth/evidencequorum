# Security Notes

EvidenceQuorum is a public GenLayer primitive for evidence attestations. It is not an identity, payment, or custody system. Consumers should treat every stored record as a claim that carries an auditable source snapshot, not as an independently guaranteed truth.

## Reporting a vulnerability

Please report a reproducible security issue privately to the repository owner. Include the affected commit, contract address or client route, steps to reproduce, and the expected versus actual result. Do not post a proof of concept that could put users, keys, or network infrastructure at risk.

## Contract boundaries

The deployed contract accepts public write calls for `attest` and `challenge`; it intentionally does not encode an owner-only role. Applications integrating the primitive must decide their own policy for trust, submission cost, rate limits, and which records they recognize. `challenge` preserves the prior record and source snapshot instead of deleting evidence history.

The deployed evidence-bound contract at `0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8` enforces a 20-character claim minimum, 2–8 distinct HTTPS source entries, bounded source captures, direct material quotations, constrained validator output, bounded confidence, and a two-source threshold for supported or refuted conclusions. Every validator independently renders and assesses the bounded source set; it rejects a leader decision when the independently derived status or material-source set differs. The browser client adds stricter convenience checks for public HTTPS URLs and rejects localhost, private IPv4 ranges, and local-development hostnames before opening a wallet. Direct contract callers are still responsible for submitting only public URLs; a future contract version should move full hostname policy on-chain before any deployment intended for high-stakes use.

## Client boundaries

The production site is a static Vite build. It has no application API, storage proxy, server-side secret access, telemetry collector, or analytics script. Read-only `count`, `get_attestation`, `get_evidence`, and `get_sources` calls use the public Studio client. `attest` and `challenge` require an explicit browser-wallet request, use zero transaction value, wait for an accepted receipt, check for execution failure, and refresh canonical state afterward.

No private key, seed phrase, RPC credential, or server secret belongs in this repository. The `.gitignore` excludes environment files and test artifacts; contributors should inspect staged changes before every commit.
