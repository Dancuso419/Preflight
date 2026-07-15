// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Onchain proof that a project passed PreFlight review.
/// Only the backend signer wallet (owner) can mint.
/// Badges are soulbound — non-transferable after mint.
contract PreFlightAttestation is ERC721, Ownable {
    struct Attestation {
        bytes32 reportHash;     // keccak256 of full report JSON
        uint8   readinessScore;
        uint64  timestamp;
        string  version;
    }

    // Start at 1 so walletToToken default (0) means "no attestation"
    uint256 private _nextTokenId = 1;

    mapping(uint256 => Attestation) public attestations;
    mapping(address => uint256)     public walletToToken;

    event AttestationMinted(address indexed wallet, uint256 tokenId, uint8 score);

    // OZ Ownable already rejects address(0) with OwnableInvalidOwner
    constructor(address signer) ERC721("PreFlight Ready", "PREFLIGHT") Ownable(signer) {}

    function mint(
        address wallet,
        bytes32 reportHash,
        uint8   readinessScore,
        string calldata version
    ) external onlyOwner returns (uint256 tokenId) {
        require(readinessScore >= 80, "Score below threshold");

        // Checks-Effects-Interactions: write state before any external call
        tokenId = _nextTokenId++;
        attestations[tokenId] = Attestation({
            reportHash:     reportHash,
            readinessScore: readinessScore,
            timestamp:      uint64(block.timestamp),
            version:        version
        });
        walletToToken[wallet] = tokenId;
        emit AttestationMinted(wallet, tokenId, readinessScore);

        _safeMint(wallet, tokenId);
    }

    function getAttestation(address wallet) external view returns (Attestation memory) {
        uint256 tokenId = walletToToken[wallet];
        require(tokenId != 0, "No attestation found for wallet");
        return attestations[tokenId];
    }

    // Soulbound: allow mints (from == address(0)) but block all transfers
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        require(from == address(0), "PreFlight badges are non-transferable");
        return super._update(to, tokenId, auth);
    }
}
