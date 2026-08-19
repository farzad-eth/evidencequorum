"""Studio integration smoke test.

Run this only with GenLayer Studio available: gltest tests/integration/ -v -s
The test intentionally uses the project's deployed Python source, not a duplicate.
"""

import pytest


@pytest.mark.integration
def test_contract_deploys_and_exposes_views(default_account):
    """Deploy the source contract through Studio and exercise the public count view."""
    from gltest import get_contract_factory

    factory = get_contract_factory("evidence_quorum")
    contract = factory.deploy(args=[])

    assert int(contract.count().call()) == 0

