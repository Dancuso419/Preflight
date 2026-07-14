// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Onchain proof that a project passed PreFlight review.
/// Only the backend signer wallet (owner) can mint.
contract PreFlightAttestation is ERC721, Ownable {
    struct Attestation {
        bytes32 reportHash;   // keccak256 of full report JSON
        uint8   readinessScore;
        uint64  timestamp;
        string  version;
        bool    verified;
    }

    uint256 private _nextTokenId;

    mapping(uint256 => Attestation) public attestations;
    mapping(address => uint256)     public walletToToken; // latest token per wallet

    event AttestationMinted(address indexed wallet, uint256 tokenId, uint8 score);

    constructor(address signer) ERC721("PreFlight Ready", "PREFLIGHT") Ownable(signer) {}

    function mint(
        address wallet,
        bytes32 reportHash,
        uint8   readinessScore,
        string calldata version
    ) external onlyOwner returns (uint256 tokenId) {
        require(readinessScore >= 80, "Score below threshold");
        tokenId = _nextTokenId++;
        _safeMint(wallet, tokenId);
        attestations[tokenId] = Attestation({
            reportHash:     reportHash,
            readinessScore: readinessScore,
            timestamp:      uint64(block.timestamp),
            version:        version,
            verified:       true
        });
        walletToToken[wallet] = tokenId;
        emit AttestationMinted(wallet, tokenId, readinessScore);
    }

    function getAttestation(address wallet) external view returns (Attestation memory) {
        return attestations[walletToToken[wallet]];
    }
}
