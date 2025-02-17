// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./ReentrancyGuard.sol";
import "./custom/Pausable.sol";
import "./custom/IERC20.sol";
import "./custom/Ownable.sol";

contract BridgeV2 is ReentrancyGuard, Ownable, Pausable {
    mapping(address => mapping(bytes32 => bool)) public processedHashes;
    mapping(address => uint256) public nonces;
    mapping(address => bool) public supportedTokens;
    
    uint256 public bridgeFee = 0.001 ether;
    uint256 public minAmount = 0.01 ether;
    uint256 public maxAmount = 1000 ether;
    
    event TokensLocked(
        address indexed token,
        address indexed from,
        uint256 amount,
        uint256 targetChainId,
        uint256 nonce
    );
    
    event TokensUnlocked(
        address indexed token,
        address indexed to,
        uint256 amount,
        bytes32 indexed transactionHash
    );
    
    event TokenAdded(address indexed token);
    event TokenRemoved(address indexed token);
    event FeeUpdated(uint256 newFee);
    event LimitsUpdated(uint256 minAmount, uint256 maxAmount);

    constructor() Ownable(msg.sender) {}

    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
        emit TokenAdded(token);
    }

    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
        emit TokenRemoved(token);
    }

    function updateBridgeFee(uint256 newFee) external onlyOwner {
        bridgeFee = newFee;
        emit FeeUpdated(newFee);
    }

    function updateLimits(uint256 _minAmount, uint256 _maxAmount) external onlyOwner {
        require(_minAmount < _maxAmount, "Invalid limits");
        minAmount = _minAmount;
        maxAmount = _maxAmount;
        emit LimitsUpdated(_minAmount, _maxAmount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external payable nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(amount >= minAmount && amount <= maxAmount, "Amount out of bounds");
        require(msg.value >= bridgeFee, "Insufficient fee");
        
        require(
            IERC20(token).transferFrom(msg.sender, address(this), amount),
            "Transfer failed"
        );
        
        uint256 nonce = nonces[msg.sender]++;
        
        emit TokensLocked(
            token,
            msg.sender,
            amount,
            targetChainId,
            nonce
        );
    }

    function unlockTokens(
        address token,
        address to,
        uint256 amount,
        bytes32 transactionHash
    ) external onlyOwner nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(!processedHashes[token][transactionHash], "Transaction already processed");
        require(amount >= minAmount && amount <= maxAmount, "Amount out of bounds");
        
        processedHashes[token][transactionHash] = true;
        
        require(
            IERC20(token).transfer(to, amount),
            "Transfer failed"
        );
        
        emit TokensUnlocked(token, to, amount, transactionHash);
    }

    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        (bool success, ) = owner().call{value: balance}("");
        require(success, "Fee withdrawal failed");
    }
}