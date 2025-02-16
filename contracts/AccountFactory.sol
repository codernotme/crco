// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./IEntryPoint.sol";

contract AccountFactory {
    IEntryPoint public immutable entryPoint;
    
    event AccountCreated(address indexed account, address indexed owner);

    constructor(address _entryPoint) {
        require(_entryPoint != address(0), "Invalid EntryPoint address");
        entryPoint = IEntryPoint(_entryPoint);
    }

    function createAccount(address owner) external returns (address) {
        bytes32 salt = keccak256(abi.encodePacked(owner, block.timestamp));
        address account = address(new Account{salt: salt}(address(entryPoint), owner));
        emit AccountCreated(account, owner);
        return account;
    }
}

contract Account {
    IEntryPoint public immutable entryPoint;
    address public owner;
    
    constructor(address _entryPoint, address _owner) {
        entryPoint = IEntryPoint(_entryPoint);
        owner = _owner;
    }
    
    function validateUserOp(
        IEntryPoint.UserOperation calldata userOp,
        bytes32 userOpHash
    ) external view returns (uint256 validationData) {
        require(msg.sender == address(entryPoint), "Account: only EntryPoint can validate");
        
        // Verify the signature
        bytes32 hash = keccak256(abi.encodePacked(userOpHash));
        require(owner == ecrecover(hash, uint8(userOp.signature[0]), 
            bytes32(userOp.signature[1:33]), 
            bytes32(userOp.signature[33:65])), 
            "Account: wrong signature"
        );
        
        return 0; // Validation successful
    }
    
    function execute(address target, uint256 value, bytes calldata data) external {
        require(msg.sender == address(entryPoint), "Account: only EntryPoint can execute");
        (bool success, ) = target.call{value: value}(data);
        require(success, "Account: execution failed");
    }
}