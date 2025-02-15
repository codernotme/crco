// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract UnlockAndBurn is ReentrancyGuard, Ownable {
    enum AssetType { ERC20, ERC721 }
    
    struct UnlockRequest {
        address wrappedAsset;
        address originalAsset;
        AssetType assetType;
        address sender;
        uint256 amount;
        uint256 tokenId;
        uint256 timestamp;
    }
    
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => address) public wrappedToOriginal;
    mapping(address => bool) public supportedWrappedAssets;
    
    event AssetBurned(
        bytes32 indexed requestId,
        address indexed wrappedAsset,
        address indexed sender,
        uint256 amount,
        uint256 tokenId
    );
    
    event AssetUnlocked(
        bytes32 indexed requestId,
        address indexed originalAsset,
        address indexed receiver,
        uint256 amount,
        uint256 tokenId
    );
    
    constructor() Ownable(msg.sender) {}
    
    function addSupportedWrappedAsset(
        address wrappedAsset,
        address originalAsset,
        AssetType /* assetType */
    ) external onlyOwner {
        require(wrappedAsset != address(0) && originalAsset != address(0), "Invalid addresses");
        supportedWrappedAssets[wrappedAsset] = true;
        wrappedToOriginal[wrappedAsset] = originalAsset;
    }
    
    function unlockAndBurn(
        address wrappedAsset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId
    ) external nonReentrant {
        require(supportedWrappedAssets[wrappedAsset], "Asset not supported");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                wrappedAsset,
                assetType,
                msg.sender,
                amount,
                tokenId,
                block.timestamp
            )
        );
        
        require(!processedRequests[requestId], "Request already processed");
        
        if (assetType == AssetType.ERC20) {
            IBurnableToken(wrappedAsset).burnFrom(msg.sender, amount);
        } else {
            require(amount == 0, "Invalid amount for ERC721");
            // Implement ERC721 burn logic here
        }
        
        processedRequests[requestId] = true;
        
        emit AssetBurned(
            requestId,
            wrappedAsset,
            msg.sender,
            amount,
            tokenId
        );
        
        // Unlock original assets
        address originalAsset = wrappedToOriginal[wrappedAsset];
        if (assetType == AssetType.ERC20) {
            require(
                IERC20(originalAsset).transfer(msg.sender, amount),
                "Transfer failed"
            );
        } else {
            IERC721(originalAsset).transferFrom(address(this), msg.sender, tokenId);
        }
        
        emit AssetUnlocked(
            requestId,
            originalAsset,
            msg.sender,
            amount,
            tokenId
        );
    }
}