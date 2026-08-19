"""Direct Mode tests for EvidenceQuorum's real contract methods.

These tests deploy the Python contract in memory through genlayer-test. Web and
LLM calls are mocked so the suite is fast, deterministic, and appropriate for CI.
"""

import json


CLAIM = "The supplied public record supports this evidence-grounded proposition."
SOURCES = [
    "https://evidence-a.example/record",
    "https://evidence-b.example/record",
]
DIRECT_RUNTIME = "v0.2.16"


def install_supported_mocks(vm):
    """Mock two independent rendered sources and a constrained LLM response."""
    vm.mock_web(
        r"https://evidence-a\.example/record",
        {"status": 200, "body": "Primary record: material evidence supports the proposition."},
    )
    vm.mock_web(
        r"https://evidence-b\.example/record",
        {"status": 200, "body": "Independent record: material evidence supports the proposition."},
    )
    vm.mock_llm(
        r"(?s).*evidence adjudicator.*",
        json.dumps(
            {
                "status": "SUPPORTED",
                "confidence": 82,
                "rationale": "Two independent source excerpts directly and materially support the proposition.",
                "source_count": 2,
            }
        ),
    )


def test_attest_writes_canonical_record_and_source_snapshot(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    claim_id = contract.attest(CLAIM, SOURCES)

    assert claim_id == "claim-0"
    assert int(contract.count()) == 1
    record = contract.get_attestation(claim_id)
    assert record.claim == CLAIM
    assert record.status == "SUPPORTED"
    assert int(record.confidence) == 82
    assert int(record.source_count) == 2
    assert record.challenged is False
    assert list(contract.get_sources(claim_id)) == SOURCES


def test_challenge_preserves_existing_attestation_history(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    claim_id = contract.attest(CLAIM, SOURCES)
    assert contract.challenge(claim_id) == claim_id

    record = contract.get_attestation(claim_id)
    assert record.challenged is True
    assert record.status == "SUPPORTED"
    assert list(contract.get_sources(claim_id)) == SOURCES
    assert int(contract.count()) == 1


def test_attest_rejects_invalid_claim_and_source_bounds(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    with direct_vm.expect_revert("claim must contain at least 20 characters"):
        contract.attest("too short", SOURCES)

    with direct_vm.expect_revert("provide between 2 and 8 independent source URLs"):
        contract.attest(CLAIM, [SOURCES[0]])

    with direct_vm.expect_revert("sources must use https:// URLs"):
        contract.attest(CLAIM, ["http://invalid.example/source", SOURCES[1]])


def test_validator_accepts_constrained_semantic_result(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    contract.attest(CLAIM, SOURCES)

    assert direct_vm.run_validator() is True


def test_unknown_claim_cannot_be_read_or_challenged(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    with direct_vm.expect_revert("unknown claim id"):
        contract.get_attestation("claim-99")

    with direct_vm.expect_revert("unknown claim id"):
        contract.challenge("claim-99")
