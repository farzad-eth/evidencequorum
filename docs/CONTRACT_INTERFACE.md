# Contract Interface and Client Mapping

The deployed evidence-bound EvidenceQuorum contract is configured by default at [`0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8`](https://explorer-studio.genlayer.com/address/0x11Bf9d2268Eccb8539A17528586E324b1cFDdbC8) on GenLayer Studio. Its finalized deployment transaction is [`0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f`](https://explorer-studio.genlayer.com/tx/0x051f42b8b6b19c2a7288ea5c5d148180c64c93c4869b108339426dbb91cf085f). The source of record is [`contracts/evidence_quorum.py`](../contracts/evidence_quorum.py). The previous URL-only deployment at `0xec5BB6E6f7B950914d55D34d931e0032935c8e89` is retained only as historical provenance.

| Contract method | Visibility | Client action | Expected result |
|---|---|---|---|
| `count()` | view | **Refresh live state** | Reads the canonical number of attestation records without a wallet. |
| `get_attestation(claim_id)` | view | **Load record** | Reads the stored claim, status, confidence, source count, rationale, timestamp, challenge flag, and revision. |
| `get_evidence(claim_id)` | view | **Load record** | Reads the immutable bounded captures, material quotations, and source stances accepted for the record. |
| `get_sources(claim_id)` | view | **Load record** | Compatibility view that reads the canonical HTTPS URLs tied to the record. |
| `attest(claim, sources)` | write | **Submit to GenLayer** | Opens the browser wallet, sends a GenLayer transaction, displays its hash, waits for acceptance, then refreshes the canonical record. |
| `challenge(claim_id)` | write | **Challenge on GenLayer** | Opens the browser wallet, sends a contract transaction, displays its hash, waits for acceptance, then refreshes the canonical record. |

The browser may perform local input checks before calling `attest`, but it must never present those checks as a completed attestation. A status becomes canonical only after `writeContract` returns a hash, the client waits for an accepted receipt, and subsequent `readContract` calls retrieve the durable record plus its immutable evidence capture.

For binary outcomes, the contract’s leader and validators independently render the bounded source set and derive an evidence-backed decision. They must agree on the decision status and material source set; valid JSON structure alone is never sufficient to accept an attestation.
