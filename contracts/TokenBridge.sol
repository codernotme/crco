// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "./Pausable.sol";
import "./IEntryPoint.sol";

contract TokenBridge is ReentrancyGuard, Pausable {
    // State variables
    mapping(bytes32 => bool) public processedOperations;
    mapping(address => uint256) public lockedTokens;
    mapping(address => uint256) public mintedTokens;
    mapping(address => bool) public supportedTokens;
    
    IEntryPoint public immutable entryPoint;
    
    // Events
    event TokensLocked(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 targetChainId,
        bytes32 operationId
    );
    
    event TokensMinted(
        address indexed token,
        address indexed to,
        uint256 amount,
        bytes32 operationId
    );
    
    event TokensBurned(
        address indexed token,
        address indexed from,
        uint256 amount,
        bytes32 operationId
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed to,
        uint256 amount,
        bytes32 operationId
    );

    constructor(address _entryPoint) {
        require(_entryPoint != address(0), "Invalid EntryPoint address");
        entryPoint = IEntryPoint(_entryPoint);
    }

    // Lock tokens on source chain
    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
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
        lockedTokens[token] += amount;
        
        // Generate unique operation ID
        bytes32 operationId = keccak256(
            abi.encodePacked(
                token,
                msg.sender,
                amount,
                targetChainId,
                block.timestamp
            )
        );
        
        emit TokensLocked(token, msg.sender, amount, targetChainId, operationId);
        return operationId;
    }

    // Mint tokens on destination chain
    function mintTokens(
        address token,
        address to,
        uint256 amount,
        bytes32 operationId
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(!processedOperations[operationId], "Operation already processed");
        
        processedOperations[operationId] = true;
        mintedTokens[token] += amount;
        
        // Mint wrapped tokens
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "mint(address,uint256)",
                to,
                amount
            )
        );
        require(success, "Token minting failed");
        
        emit TokensMinted(token, to, amount, operationId);
    }

    // Burn tokens on destination chain
    function burnTokens(
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused returns (bytes32) {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
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
                block.timestamp
            )
        );
        
        emit TokensBurned(token, msg.sender, amount, operationId);
        return operationId;
    }

    // Unlock tokens on source chain
    function unlockTokens(
        address token,
        address to,
        uint256 amount,
        bytes32 operationId
    ) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(!processedOperations[operationId], "Operation already processed");
        require(lockedTokens[token] >= amount, "Insufficient locked tokens");
        
        processedOperations[operationId] = true;
        lockedTokens[token] -= amount;
        
        // Transfer tokens back to user
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                to,
                amount
            )
        );
        require(success, "Token transfer failed");
        
        emit TokensUnlocked(token, to, amount, operationId);
    }

    // ERC-4337 support
    function handleUserOperation(
        IEntryPoint.UserOperation calldata userOp,
        bytes32 operationId
    ) external nonReentrant whenNotPaused {
        require(msg.sender == address(entryPoint), "Only EntryPoint can call");
        require(!processedOperations[operationId], "Operation already processed");
        
        processedOperations[operationId] = true;
        
        // Execute the user operation
        (bool success, ) = userOp.sender.call(userOp.callData);
        require(success, "User operation failed");
    }

    // Admin functions
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}