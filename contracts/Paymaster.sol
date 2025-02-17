// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IEntryPoint.sol";
import "./Pausable.sol";
import "./ReentrancyGuard.sol";
abstract contract Paymaster is Pausable, ReentrancyGuard {
    IEntryPoint public immutable entryPoint;
    mapping(address => bool) public supportedTokens;
    
    event PaymasterDeposited(address indexed token, uint256 amount);
    event PaymasterWithdrawn(address indexed token, uint256 amount);

    constructor(address _entryPoint) {
        require(_entryPoint != address(0), "Invalid EntryPoint address");
        entryPoint = IEntryPoint(_entryPoint);
    }

    function validatePaymasterUserOp(
        IEntryPoint.UserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    ) external view returns (bytes memory context, uint256 validationData) {
        // Verify the token is supported
        address token = address(bytes20(userOp.paymasterAndData[20:40]));
        require(supportedTokens[token], "Token not supported");
        
        // Verify sufficient balance
        uint256 tokenBalance = getTokenBalance(token);
        require(tokenBalance >= maxCost, "Insufficient balance");
        
        return (abi.encode(token, maxCost), 0);
    }
    
    function postOp(
        IEntryPoint.UserOperation calldata userOp,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        require(msg.sender == address(entryPoint), "Only EntryPoint can call");
        
        (address token, uint256 maxCost) = abi.decode(context, (address, uint256));
        uint256 actualCost = actualGasCost > maxCost ? maxCost : actualGasCost;
        
        // Transfer tokens to cover gas costs
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                address(entryPoint),
                actualCost
            )
        );
        require(success, "Token transfer failed");
    }
    
    function deposit(address token, uint256 amount) external nonReentrant whenNotPaused {
        require(supportedTokens[token], "Token not supported");
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens to paymaster
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transferFrom(address,address,uint256)",
                msg.sender,
                address(this),
                amount
            )
        );
        require(success, "Token transfer failed");
        
        emit PaymasterDeposited(token, amount);
    }
    
    function withdraw(address token, uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from paymaster
        (bool success, ) = token.call(
            abi.encodeWithSignature(
                "transfer(address,uint256)",
                msg.sender,
                amount
            )
        );
        require(success, "Token transfer failed");
        
        emit PaymasterWithdrawn(token, amount);
    }
    
    function getTokenBalance(address token) public view returns (uint256) {
        (bool success, bytes memory data) = token.staticcall(
            abi.encodeWithSignature("balanceOf(address)", address(this))
        );
        require(success, "Balance check failed");
        return abi.decode(data, (uint256));
    }
    
    function addSupportedToken(address token) external onlyOwner {
        require(token != address(0), "Invalid token address");
        supportedTokens[token] = true;
    }
    
    function removeSupportedToken(address token) external onlyOwner {
        supportedTokens[token] = false;
    }
}