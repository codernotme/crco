// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Bridge is ReentrancyGuard, Ownable {
    mapping(address => mapping(bytes32 => bool)) public processedHashes;
    mapping(address => uint256) public nonces;
    
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

    constructor() Ownable(msg.sender) {}

    function lockTokens(
        address token,
        uint256 amount,
        uint256 targetChainId
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than 0");
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
    ) external onlyOwner nonReentrant {
        require(!processedHashes[token][transactionHash], "Transaction already processed");
        require(amount > 0, "Amount must be greater than 0");
        
        processedHashes[token][transactionHash] = true;
        
        require(
            IERC20(token).transfer(to, amount),
            "Transfer failed"
        );
        
        emit TokensUnlocked(token, to, amount, transactionHash);
    }
}