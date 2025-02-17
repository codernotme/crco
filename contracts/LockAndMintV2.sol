// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

contract LockAndMintV2 is ReentrancyGuard, Ownable {
    enum AssetType { ERC20, ERC721 }
    
    struct AssetInfo {
        address asset;
        address wrappedVersion;
        AssetType assetType;
        bool isSupported;
    }
    
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => AssetInfo) public supportedAssets;
    mapping(address => bool) internal trustedForwarders;
    
    event AssetLocked(
        bytes32 indexed requestId,
        address indexed asset,
        AssetType assetType,
        address indexed sender,
        address receiver,
        uint256 amount,
        uint256 tokenId
    );
    
    event AssetMinted(
        bytes32 indexed requestId,
        address indexed wrappedAsset,
        address indexed receiver,
        uint256 amount,
        uint256 tokenId
    );
    
    constructor() Ownable(msg.sender) {}
    
    modifier onlyTrustedForwarder() {
        require(trustedForwarders[msg.sender], "Not a trusted forwarder");
        _;
    }

    function addSupportedAsset(
        address asset,
        address wrappedVersion,
        AssetType assetType
    ) external onlyOwner {
        require(asset != address(0) && wrappedVersion != address(0), "Invalid addresses");
        supportedAssets[asset] = AssetInfo({
            asset: asset,
            wrappedVersion: wrappedVersion,
            assetType: assetType,
            isSupported: true
        });
    }

    function addTrustedForwarder(address forwarder) external onlyOwner {
        trustedForwarders[forwarder] = true;
    }
    
    function lockAndMint(
        address asset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        address receiver,
        address targetChainReceiver
    ) external nonReentrant {
        require(supportedAssets[asset].isSupported, "Asset not supported");
        require(receiver != address(0) && targetChainReceiver != address(0), "Invalid receivers");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                asset,
                assetType,
                msg.sender,
                receiver,
                targetChainReceiver,
                amount,
                tokenId,
                block.timestamp
            )
        );
        
        require(!processedRequests[requestId], "Request already processed");
        
        if (assetType == AssetType.ERC20) {
            require(
                IERC20(asset).transferFrom(msg.sender, address(this), amount),
                "Transfer failed"
            );
        } else {
            require(amount == 0, "Invalid amount for ERC721");
            IERC721(asset).transferFrom(msg.sender, address(this), tokenId);
        }
        
        processedRequests[requestId] = true;
        
        emit AssetLocked(
            requestId,
            asset,
            assetType,
            msg.sender,
            receiver,
            amount,
            tokenId
        );
        
        // Mint wrapped tokens
        address wrappedAsset = supportedAssets[asset].wrappedVersion;
        if (assetType == AssetType.ERC20) {
            IMintableToken(wrappedAsset).mint(receiver, amount);
        }
        
        emit AssetMinted(
            requestId,
            wrappedAsset,
            receiver,
            amount,
            tokenId
        );
    }

    function gaslessLockAndMint(
        address asset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        address receiver,
        address targetChainReceiver,
        address originalSender
    ) external onlyTrustedForwarder {
        // Same logic as lockAndMint but uses originalSender instead of msg.sender
        require(supportedAssets[asset].isSupported, "Asset not supported");
        require(receiver != address(0) && targetChainReceiver != address(0), "Invalid receivers");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                asset,
                assetType,
                originalSender,
                receiver,
                targetChainReceiver,
                amount,
                tokenId,
                block.timestamp
            )
        );
        
        require(!processedRequests[requestId], "Request already processed");
        
        if (assetType == AssetType.ERC20) {
            require(
                IERC20(asset).transferFrom(originalSender, address(this), amount),
                "Transfer failed"
            );
        } else {
            require(amount == 0, "Invalid amount for ERC721");
            IERC721(asset).transferFrom(originalSender, address(this), tokenId);
        }
        
        processedRequests[requestId] = true;
        
        emit AssetLocked(
            requestId,
            asset,
            assetType,
            originalSender,
            receiver,
            amount,
            tokenId
        );
        
        address wrappedAsset = supportedAssets[asset].wrappedVersion;
        if (assetType == AssetType.ERC20) {
            IMintableToken(wrappedAsset).mint(receiver, amount);
        }
        
        emit AssetMinted(
            requestId,
            wrappedAsset,
            receiver,
            amount,
            tokenId
        );
    }
}