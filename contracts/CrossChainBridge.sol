// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "./custom/Pausable.sol";
import "./IEntryPoint.sol";

contract CrossChainBridge is ReentrancyGuard, Pausable {
    // State variables
    mapping(bytes32 => bool) public processedOperations;
    mapping(address => mapping(uint256 => uint256)) public lockedTokens;
    mapping(address => mapping(uint256 => uint256)) public mintedTokens;
    mapping(address => bool) public supportedTokens;
    mapping(uint256 => bool) public supportedChains;
    
    IEntryPoint public immutable entryPoint;
    uint256 public constant MIN_LOCK_PERIOD = 1 hours;
    uint256 public constant MAX_LOCK_AMOUNT = 1000000 ether;
    uint256 public bridgeFee = 0.001 ether;
    
    // Events
    event TokensLocked(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 sourceChainId,
        uint256 targetChainId,
        address receiver,
        bytes32 operationId
    );
    
    event TokensMinted(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 chainId,
        bytes32 operationId
    );
    
    event TokensBurned(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 chainId,
        bytes32 operationId
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed to,
        uint256 amount,
        uint256 chainId,
        bytes32 operationId
    );

    event ChainAdded(uint256 chainId);
    event ChainRemoved(uint256 chainId);
    event BridgeFeeUpdated(uint256 newFee);

    constructor(address _entryPoint) Ownable(msg.sender) {
        require(_entryPoint != address(0), "Invalid EntryPoint address");
        entryPoint = IEntryPoint(_entryPoint);
    }

    // Cross-chain transfer function
    function transferAsset(
        address token,
        uint256 amount,
        uint256 targetChainId,
        address receiver
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(supportedTokens[token], "Token not supported");
        require(supportedChains[targetChainId], "Chain not supported");
        require(amount > 0 && amount <= MAX_LOCK_AMOUNT, "Invalid amount");
        require(receiver != address(0), "Invalid receiver");
        
        // Transfer tokens to bridge
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        require(success, "Token transfer failed");
        
        // Update locked tokens
        lockedTokens[token][block.chainid] += amount;
        
        // Generate unique operation ID
        bytes32 operationId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                amount,
                block.chainid,
                targetChainId,
                receiver,
                block.timestamp
            )
        );
        
        emit TokensLocked(
            token,
            msg.sender,
            amount,
            block.chainid,
            targetChainId,
            receiver,
            operationId
        );
        
        return operationId;
    }

    // Lock and mint function
    function lockAndMint(
        address token,
        uint256 amount,
        address receiver
    ) external payable nonReentrant whenNotPaused returns (bytes32) {
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        require(supportedTokens[token], "Token not supported");
        require(amount > 0 && amount <= MAX_LOCK_AMOUNT, "Invalid amount");
        require(receiver != address(0), "Invalid receiver");
        
        // Transfer tokens to bridge
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        require(success, "Token transfer failed");
        
        // Update locked tokens
        lockedTokens[token][block.chainid] += amount;
        
        // Generate unique operation ID
        bytes32 operationId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                amount,
                block.chainid,
                receiver,
                block.timestamp
            )
        );
        
        emit TokensLocked(
            token,
            msg.sender,
            amount,
            block.chainid,
            0,
            receiver,
            operationId
        );
        
        return operationId;
    }

    // Burn and unlock function
    function burnAndUnlock(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0 && amount <= MAX_LOCK_AMOUNT, "Invalid amount");
        
        // Burn wrapped tokens
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "burnFrom(address,uint256)",
                msg.sender,
                amount
            )
        );
        require(success, "Token burning failed");
        
        // Generate unique operation ID
        bytes32 operationId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                amount,
                block.chainid,
                block.timestamp
            )
        );
        
        emit TokensBurned(
            token,
            msg.sender,
            amount,
            block.chainid,
            operationId
        );
        
        return operationId;
    }

    // Admin functions
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function addSupportedChain(uint256 chainId) external onlyOwner {
        require(chainId > 0, "Invalid chain ID");
        supportedChains[chainId] = true;
        emit ChainAdded(chainId);
    }

    function removeSupportedChain(uint256 chainId) external onlyOwner {
        supportedChains[chainId] = false;
        emit ChainRemoved(chainId);
    }

    function updateBridgeFee(uint256 newFee) external onlyOwner {
        bridgeFee = newFee;
        emit BridgeFeeUpdated(newFee);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}