// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IEntryPoint.sol";
import "./ReentrancyGuard.sol";

contract EntryPoint is IEntryPoint, ReentrancyGuard {
    mapping(address => uint256) public balances;
    mapping(address => uint256) public nonces;

    event UserOperationEvent(bytes32 indexed userOpHash, address indexed sender, address indexed paymaster);
    event AccountDeployed(bytes32 indexed userOpHash, address indexed sender);

    function handleOps(UserOperation[] calldata ops, address payable beneficiary) external nonReentrant {
        for (uint256 i = 0; i < ops.length; i++) {
            UserOperation calldata op = ops[i];
            
            // Generate operation hash
            bytes32 userOpHash = keccak256(abi.encode(op));
            
            // Validate operation
            _validateUserOp(op, userOpHash);
            
            // Execute operation
            _executeUserOp(op, userOpHash);
            
            emit UserOperationEvent(userOpHash, op.sender, address(bytes20(op.paymasterAndData[:20])));
        }
        
        // Pay the beneficiary
        if (beneficiary != address(0)) {
            uint256 balance = address(this).balance;
            if (balance > 0) {
                (bool success, ) = beneficiary.call{value: balance}("");
                require(success, "Transfer to beneficiary failed");
            }
        }
    }

    function simulateValidation(UserOperation calldata userOp) external {
        bytes32 userOpHash = keccak256(abi.encode(userOp));
        _validateUserOp(userOp, userOpHash);
    }

    function _validateUserOp(UserOperation calldata userOp, bytes32 userOpHash) internal {
        // Verify nonce
        require(nonces[userOp.sender] == userOp.nonce, "Invalid nonce");
        nonces[userOp.sender]++;
        
        // Deploy account if needed
        if (userOp.initCode.length > 0) {
            _deployAccount(userOp, userOpHash);
        }
        
        // Validate account
        (bool success, bytes memory ret) = userOp.sender.staticcall(
            abi.encodeWithSignature(
                "validateUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32)",
                userOp,
                userOpHash
            )
        );
        require(success && abi.decode(ret, (uint256)) == 0, "Account validation failed");
        
        // Validate paymaster if used
        if (userOp.paymasterAndData.length > 0) {
            address paymaster = address(bytes20(userOp.paymasterAndData[:20]));
            (success, ret) = paymaster.staticcall(
                abi.encodeWithSignature(
                    "validatePaymasterUserOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes32,uint256)",
                    userOp,
                    userOpHash,
                    userOp.maxFeePerGas * userOp.callGasLimit
                )
            );
            require(success && abi.decode(ret, (uint256)) == 0, "Paymaster validation failed");
        }
    }

    function _executeUserOp(UserOperation calldata userOp, bytes32 /* userOpHash */) internal {
        uint256 preGas = gasleft();
        
        // Execute the operation
        (bool success, ) = userOp.sender.call(userOp.callData);
        require(success, "User operation execution failed");
        
        // Handle paymaster post-op
        if (userOp.paymasterAndData.length > 0) {
            address paymaster = address(bytes20(userOp.paymasterAndData[:20]));
            (bool pmSuccess, ) = paymaster.call(
                abi.encodeWithSignature(
                    "postOp((address,uint256,bytes,bytes,uint256,uint256,uint256,uint256,uint256,bytes,bytes),bytes,uint256)",
                    userOp,
                    "",
                    preGas - gasleft()
                )
            );
            require(pmSuccess, "Paymaster postOp failed");
        }
    }

    function _deployAccount(UserOperation calldata userOp, bytes32 userOpHash) internal {
        bytes memory initCode = userOp.initCode;
        address sender = userOp.sender;
        
        // Deploy the account
        assembly {
            if iszero(create2(0, add(initCode, 0x20), mload(initCode), sender)) {
                revert(0, 0)
            }
        }
        
        require(sender.code.length > 0, "Account deployment failed");
        emit AccountDeployed(userOpHash, sender);
    }

    receive() external payable {
        balances[msg.sender] += msg.value;
    }
}