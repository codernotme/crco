// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GaslessForwarder is Ownable {
    using ECDSA for bytes32;

    mapping(bytes32 => bool) public executed;
    mapping(address => uint256) public nonces;
    
    event RequestExecuted(
        address indexed from,
        address indexed to,
        bytes data,
        uint256 nonce
    );

    constructor() Ownable(msg.sender) {}

    function execute(
        address from,
        address to,
        bytes calldata data,
        uint256 nonce,
        bytes calldata signature
    ) external returns (bool, bytes memory) {
        require(nonce == nonces[from], "Invalid nonce");
        
        bytes32 hash = keccak256(
            abi.encodePacked(
                from,
                to,
                data,
                nonce,
                block.chainid
            )
        );

        bytes32 messageHash = ECDSA.toEthSignedMessageHash(hash);
        address signer = messageHash.recover(signature);
        
        require(signer == from, "Invalid signature");
        require(!executed[hash], "Request already executed");
        
        executed[hash] = true;
        nonces[from]++;

        (bool success, bytes memory result) = to.call(data);
        require(success, "Forwarded call failed");

        emit RequestExecuted(from, to, data, nonce);
        
        return (success, result);
    }

    function getNonce(address from) external view returns (uint256) {
        return nonces[from];
    }
}