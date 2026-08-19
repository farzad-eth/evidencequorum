# Contract Interface and Client Mapping

The deployed EvidenceQuorum contract is configured by default at `0xec5BB6E6f7B950914d55D34d931e0032935c8e89` on GenLayer Studio. The source of record is [`contracts/evidence_quorum.py`](../contracts/evidence_quorum.py).

| Contract method | Visibility | Client action | Expected result |
|---|---|---|---|
| `count()` | view | **Refresh live state** | Reads the canonical number of attestation records without a wallet. |
| `get_attestation(claim_id)` | view | **Load record** | Reads the stored claim, status, confidence, source count, rationale, timestamp, challenge flag, and revision. |
| `get_sources(claim_id)` | view | **Load record** | Reads the canonical HTTPS source snapshot tied to the record. |
| `attest(claim, sources)` | write | **Submit to GenLayer** | Opens the browser wallet, sends a GenLayer transaction, displays its hash, waits for acceptance, then refreshes the canonical record. |
| `challenge(claim_id)` | write | **Challenge on GenLayer** | Opens the browser wallet, sends a contract transaction, displays its hash, waits for acceptance, then refreshes the canonical record. |

The browser may perform local input checks before calling `attest`, but it must never present those checks as a completed attestation. A status becomes canonical only after `writeContract` returns a hash, the client waits for an accepted receipt, and a subsequent `readContract` call retrieves the durable record.

