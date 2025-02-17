// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IBurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract UnlockAndBurnV2 is ReentrancyGuard, Ownable {
    enum AssetType { ERC20, ERC721 }
    
    struct AssetInfo {
        address wrappedAsset;
        address originalAsset;
        AssetType assetType;
        bool isSupported;
    }
    
    mapping(bytes32 => bool) public processedRequests;
    mapping(address => AssetInfo) public supportedWrappedAssets;
    mapping(address => bool) public trustedForwarders;
    
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
    
    modifier onlyTrustedForwarder() {
        require(trustedForwarders[msg.sender], "Not a trusted forwarder");
        _;
    }

    function addSupportedWrappedAsset(
        address wrappedAsset,
        address originalAsset,
        AssetType assetType
    ) external onlyOwner {
        require(wrappedAsset != address(0) && originalAsset != address(0), "Invalid addresses");
        supportedWrappedAssets[wrappedAsset] = AssetInfo({
            wrappedAsset: wrappedAsset,
            originalAsset: originalAsset,
            assetType: assetType,
            isSupported: true
        });
    }

    function addTrustedForwarder(address forwarder) external onlyOwner {
        trustedForwarders[forwarder] = true;
    }
    
    function unlockAndBurn(
        address wrappedAsset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        address targetChainReceiver
    ) external nonReentrant {
        require(supportedWrappedAssets[wrappedAsset].isSupported, "Asset not supported");
        require(targetChainReceiver != address(0), "Invalid receiver");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                wrappedAsset,
                assetType,
                msg.sender,
                targetChainReceiver,
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
        
        address originalAsset = supportedWrappedAssets[wrappedAsset].originalAsset;
        if (assetType == AssetType.ERC20) {
            require(
                IERC20(originalAsset).transfer(targetChainReceiver, amount),
                "Transfer failed"
            );
        } else {
            IERC721(originalAsset).transferFrom(address(this), targetChainReceiver, tokenId);
        }
        
        emit AssetUnlocked(
            requestId,
            originalAsset,
            targetChainReceiver,
            amount,
            tokenId
        );
    }

    function gaslessUnlockAndBurn(
        address wrappedAsset,
        AssetType assetType,
        uint256 amount,
        uint256 tokenId,
        address targetChainReceiver,
        address originalSender
    ) external onlyTrustedForwarder {
        require(supportedWrappedAssets[wrappedAsset].isSupported, "Asset not supported");
        require(targetChainReceiver != address(0), "Invalid receiver");
        
        bytes32 requestId = keccak256(
            abi.encodePacked(
                wrappedAsset,
                assetType,
                originalSender,
                targetChainReceiver,
                amount,
                tokenId,
                block.timestamp
            )
        );
        
        require(!processedRequests[requestId], "Request already processed");
        
        if (assetType == AssetType.ERC20) {
            IBurnableToken(wrappedAsset).burnFrom(originalSender, amount);
        } else {
            require(amount == 0, "Invalid amount for ERC721");
            // Implement ERC721 burn logic here
        }
        
        processedRequests[requestId] = true;
        
        emit AssetBurned(
            requestId,
            wrappedAsset,
            originalSender,
            amount,
            tokenId
        );
        
        address originalAsset = supportedWrappedAssets[wrappedAsset].originalAsset;
        if (assetType == AssetType.ERC20) {
            require(
                IERC20(originalAsset).transfer(targetChainReceiver, amount),
                "Transfer failed"
            );
        } else {
            IERC721(originalAsset).transferFrom(address(this), targetChainReceiver, tokenId);
        }
        
        emit AssetUnlocked(
            requestId,
            originalAsset,
            targetChainReceiver,
            amount,
            tokenId
        );
    }
}