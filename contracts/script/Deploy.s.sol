// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/PreFlightAttestation.sol";

contract Deploy is Script {
    function run() external {
        address signer = vm.envAddress("BACKEND_SIGNER_ADDRESS");
        vm.startBroadcast();
        PreFlightAttestation attestation = new PreFlightAttestation(signer);
        vm.stopBroadcast();
        console.log("PreFlightAttestation deployed at:", address(attestation));
    }
}
