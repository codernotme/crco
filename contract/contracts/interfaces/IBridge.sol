// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IBridge {
    enum AssetType { ERC20, ERC721 }
    enum ChainType { AMOY_TESTNET, SEPOLIA_TESTNET }

    function lockAndMint(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        address receiverAddress,
        ChainType sourceChain,
        ChainType targetChain
    ) external payable;

    function unlockAndBurn(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) external;

    function initiateCrossChainTransfer(
        AssetType assetType,
        address assetAddress,
        ChainType sourceChain,
        ChainType targetChain,
        uint256 amount,
        address receiverAddress
    ) external payable;

    function completeCrossChainTransfer(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        address receiverAddress,
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) external;

    function verifyTransfer(
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) external pure returns (bool);
}