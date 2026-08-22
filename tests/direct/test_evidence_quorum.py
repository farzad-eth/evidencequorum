"""Direct Mode tests for EvidenceQuorum's evidence-grounded consensus boundary.

Web and LLM calls are mocked so the suite verifies the leader/validator decision
flow deterministically, including semantic disagreement cases that must not write
canonical state.
"""

import json


CLAIM = "The supplied public record supports this evidence-grounded proposition."
SOURCES = [
    "https://evidence-a.example/record",
    "https://evidence-b.example/record",
]
DIRECT_RUNTIME = "v0.2.16"

SUPPORT_A = "Primary record confirms the proposition with direct material facts and independently published dates."
SUPPORT_B = "Independent record confirms the proposition with direct material facts and separately reported figures."
REFUTE_A = "Primary record directly contradicts the proposition and documents the opposite material outcome."
REFUTE_B = "Independent record directly contradicts the proposition and reports the opposite material outcome."
IRRELEVANT_A = "This page discusses an unrelated historical subject and contains no material evidence about the proposition at issue."
IRRELEVANT_B = "This independent page is also unrelated, ambiguous, and provides no direct evidence resolving the submitted proposition."


def supported_response():
    return {
        "status": "SUPPORTED",
        "confidence": 82,
        "rationale": "Two independent captured sources directly and materially support the submitted proposition.",
        "citations": [
            {"source_index": 0, "quote": SUPPORT_A},
            {"source_index": 1, "quote": SUPPORT_B},
        ],
    }


def refuted_response():
    return {
        "status": "REFUTED",
        "confidence": 88,
        "rationale": "Two independent captured sources directly and materially contradict the submitted proposition.",
        "citations": [
            {"source_index": 0, "quote": REFUTE_A},
            {"source_index": 1, "quote": REFUTE_B},
        ],
    }


def inconclusive_response():
    return {
        "status": "INCONCLUSIVE",
        "confidence": 12,
        "rationale": "The bounded captures are unrelated to the submitted proposition and cannot support a binary decision.",
        "citations": [],
    }


def install_web_mocks(vm, source_a, source_b):
    vm.mock_web(r"https://evidence-a\.example/record", {"status": 200, "body": source_a})
    vm.mock_web(r"https://evidence-b\.example/record", {"status": 200, "body": source_b})


def install_supported_mocks(vm):
    install_web_mocks(vm, SUPPORT_A, SUPPORT_B)
    vm.mock_llm(r"(?s).*evidence adjudicator.*", json.dumps(supported_response()))


def install_refuted_mocks(vm):
    install_web_mocks(vm, REFUTE_A, REFUTE_B)
    vm.mock_llm(r"(?s).*evidence adjudicator.*", json.dumps(refuted_response()))


def install_inconclusive_mocks(vm):
    install_web_mocks(vm, IRRELEVANT_A, IRRELEVANT_B)
    vm.mock_llm(r"(?s).*evidence adjudicator.*", json.dumps(inconclusive_response()))


def test_attest_writes_immutable_evidence_snapshots(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    claim_id = contract.attest(CLAIM, SOURCES)

    assert claim_id == "claim-0"
    assert int(contract.count()) == 1
    record = contract.get_attestation(claim_id)
    evidence = json.loads(contract.get_evidence(claim_id))
    assert record.status == "SUPPORTED"
    assert int(record.source_count) == 2
    assert [snapshot["url"] for snapshot in evidence] == SOURCES
    assert [snapshot["captured_text"] for snapshot in evidence] == [SUPPORT_A, SUPPORT_B]
    assert [snapshot["material_quote"] for snapshot in evidence] == [SUPPORT_A, SUPPORT_B]
    assert [snapshot["stance"] for snapshot in evidence] == ["SUPPORTS", "SUPPORTS"]
    assert list(contract.get_sources(claim_id)) == SOURCES


def test_refuted_evidence_writes_refuted_record(direct_vm, direct_deploy):
    install_refuted_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    claim_id = contract.attest(CLAIM, SOURCES)

    record = contract.get_attestation(claim_id)
    evidence = json.loads(contract.get_evidence(claim_id))
    assert record.status == "REFUTED"
    assert int(record.source_count) == 2
    assert [snapshot["stance"] for snapshot in evidence] == ["REFUTES", "REFUTES"]


def test_validator_rejects_well_formed_supported_payload_when_evidence_is_irrelevant(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    contract.attest(CLAIM, SOURCES)
    direct_vm.clear_mocks()
    install_inconclusive_mocks(direct_vm)

    assert direct_vm.run_validator() is False


def test_validator_rejects_supported_payload_when_independent_evidence_refutes_claim(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    contract.attest(CLAIM, SOURCES)
    direct_vm.clear_mocks()
    install_refuted_mocks(direct_vm)

    assert direct_vm.run_validator() is False


def test_attest_rejects_fabricated_quote_even_when_payload_schema_is_well_formed(direct_vm, direct_deploy):
    install_web_mocks(direct_vm, SUPPORT_A, SUPPORT_B)
    fabricated = supported_response()
    fabricated["citations"] = [
        {"source_index": 0, "quote": "A fabricated quotation that does not occur in the captured evidence."},
        {"source_index": 1, "quote": SUPPORT_B},
    ]
    direct_vm.mock_llm(r"(?s).*evidence adjudicator.*", json.dumps(fabricated))
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    with direct_vm.expect_revert("validator returned an invalid evidence-grounded attestation"):
        contract.attest(CLAIM, SOURCES)


def test_challenge_preserves_immutable_evidence_history(direct_vm, direct_deploy):
    install_supported_mocks(direct_vm)
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    claim_id = contract.attest(CLAIM, SOURCES)
    original_evidence = json.loads(contract.get_evidence(claim_id))
    assert contract.challenge(claim_id) == claim_id

    record = contract.get_attestation(claim_id)
    preserved_evidence = json.loads(contract.get_evidence(claim_id))
    assert record.challenged is True
    assert [snapshot["captured_text"] for snapshot in preserved_evidence] == [snapshot["captured_text"] for snapshot in original_evidence]
    assert [snapshot["material_quote"] for snapshot in preserved_evidence] == [snapshot["material_quote"] for snapshot in original_evidence]


def test_attest_rejects_invalid_claim_and_source_bounds(direct_vm, direct_deploy):
    contract = direct_deploy("contracts/evidence_quorum.py", sdk_version=DIRECT_RUNTIME)

    with direct_vm.expect_revert("claim must contain at least 20 characters"):
        contract.attest("too short", SOURCES)

    with direct_vm.expect_revert("provide between 2 and 8 independent source URLs"):
        contract.attest(CLAIM, [SOURCES[0]])

    with direct_vm.expect_revert("sources must use https:// URLs"):
        contract.attest(CLAIM, ["http://invalid.example/source", SOURCES[1]])

    with direct_vm.expect_revert("sources must be distinct"):
        contract.attest(CLAIM, [SOURCES[0], SOURCES[0]])
