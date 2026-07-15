// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/PreFlightAttestation.sol";

contract PreFlightAttestationTest is Test {
    PreFlightAttestation attestation;
    address signer  = address(this);
    address builder = address(0xBEEF);
    address other   = address(0xCAFE);

    function setUp() public {
        attestation = new PreFlightAttestation(signer);
    }

    // --- mint ---

    function test_mint_succeeds_above_threshold() public {
        uint256 id = attestation.mint(builder, keccak256("report"), 85, "v1.0.0");
        assertEq(attestation.ownerOf(id), builder);
        assertEq(attestation.getAttestation(builder).readinessScore, 85);
    }

    function test_mint_blocked_below_threshold() public {
        vm.expectRevert("Score below threshold");
        attestation.mint(builder, keccak256("report"), 79, "v1.0.0");
    }

    function test_only_owner_can_mint() public {
        vm.prank(builder);
        vm.expectRevert();
        attestation.mint(builder, keccak256("report"), 90, "v1.0.0");
    }

    function test_token_ids_start_at_1() public {
        uint256 id = attestation.mint(builder, keccak256("report"), 80, "v1.0.0");
        assertEq(id, 1, "first token should be id 1, not 0");
    }

    function test_mint_stores_all_fields() public {
        bytes32 hash = keccak256("myreport");
        attestation.mint(builder, hash, 92, "v1.0.0");
        PreFlightAttestation.Attestation memory a = attestation.getAttestation(builder);
        assertEq(a.reportHash,      hash);
        assertEq(a.readinessScore,  92);
        assertEq(a.version,         "v1.0.0");
        assertGt(a.timestamp,       0);
    }

    // --- getAttestation ---

    function test_getAttestation_reverts_for_unknown_wallet() public {
        vm.expectRevert("No attestation found for wallet");
        attestation.getAttestation(other);
    }

    function test_getAttestation_returns_latest_on_remint() public {
        attestation.mint(builder, keccak256("report1"), 80, "v1.0.0");
        attestation.mint(builder, keccak256("report2"), 95, "v1.0.0");
        assertEq(attestation.getAttestation(builder).readinessScore, 95);
    }

    // --- soulbound ---

    function test_transfer_is_blocked() public {
        attestation.mint(builder, keccak256("report"), 85, "v1.0.0");
        vm.prank(builder);
        vm.expectRevert("PreFlight badges are non-transferable");
        attestation.transferFrom(builder, other, 1);
    }

    function test_safe_transfer_is_blocked() public {
        attestation.mint(builder, keccak256("report"), 85, "v1.0.0");
        vm.prank(builder);
        vm.expectRevert("PreFlight badges are non-transferable");
        attestation.safeTransferFrom(builder, other, 1);
    }

    // --- constructor guard ---

    function test_constructor_rejects_zero_address_signer() public {
        // OZ Ownable throws OwnableInvalidOwner — any revert is sufficient
        vm.expectRevert();
        new PreFlightAttestation(address(0));
    }
}
