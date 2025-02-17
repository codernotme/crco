// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./custom/Ownable.sol";

contract GaslessForwarder is Ownable {
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

        bytes32 messageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
        );
        address signer = recoverSigner(messageHash, signature);
        
        require(signer == from, "Invalid signature");
        require(!executed[hash], "Request already executed");
        
        executed[hash] = true;
        nonces[from]++;

        (bool success, bytes memory result) = to.call(data);
        require(success, "Forwarded call failed");

        emit RequestExecuted(from, to, data, nonce);
        
        return (success, result);
    }

    function recoverSigner(bytes32 messageHash, bytes memory signature) internal pure returns (address) {
        require(signature.length == 65, "Invalid signature length");

        bytes32 r;
        bytes32 s;
        uint8 v;

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }

        if (v < 27) {
            v += 27;
        }

        require(v == 27 || v == 28, "Invalid signature 'v' value");

        return ecrecover(messageHash, v, r, s);
    }

    function getNonce(address from) external view returns (uint256) {
        return nonces[from];
    }
}