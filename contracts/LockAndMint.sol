// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IMintableToken {
    function mint(address to, uint256 amount) external;
}

contract LockAndMint is ReentrancyGuard, Ownable {
    enum AssetType { ERC20, ERC721 }
    
    struct LockRequest {
        address asset;
        AssetType assetType;
        address sender;
        address receiver;
        uint256 amount;
        uint256 tokenId;
        uint256 timestamp;
    }
    
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => bool) public supportedAssets;
    mapping(address => address) public assetToWrapped;
    
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
    
    function addSupportedAsset(
        address asset,
        address wrappedVersion,
        AssetType /* assetType */
    ) external onlyOwner {
        require(asset != address(0) && wrappedVersion != address(0), "Invalid addresses");
        supportedAssets[asset] = true;
        assetToWrapped[asset] = wrappedVersion;
    }
    
    function lockAndMint(
        address asset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        address receiver
    ) external nonReentrant {
        require(supportedAssets[asset], "Asset not supported");
        require(receiver != address(0), "Invalid receiver");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                asset,
                assetType,
                msg.sender,
                receiver,
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
        address wrappedAsset = assetToWrapped[asset];
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