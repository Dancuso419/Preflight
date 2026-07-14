// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/PreFlightAttestation.sol";

contract PreFlightAttestationTest is Test {
    PreFlightAttestation attestation;
    address signer = address(this);
    address builder = address(0xBEEF);

    function setUp() public {
        attestation = new PreFlightAttestation(signer);
    }

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
}
