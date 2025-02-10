// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./TokenWrapper.sol";

contract BridgeCore is ReentrancyGuard, Ownable, Pausable {
    using ECDSA for bytes32;

    TokenWrapper public immutable token;
    
    uint256 public nonce;
    mapping(bytes32 => bool) public processedHashes;
    mapping(address => uint256) public lastNonce;
    
    event TokensLocked(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 nonce,
        string fromChain,
        string toChain
    );
    
    event TokensUnlocked(
        address indexed receiver,
        uint256 amount,
        bytes32 indexed txHash
    );
    
    event NFTLocked(
        address indexed sender,
        address indexed receiver,
        uint256 tokenId,
        uint256 nonce,
        string fromChain,
        string toChain
    );
    
    event NFTUnlocked(
        address indexed receiver,
        uint256 tokenId,
        bytes32 indexed txHash
    );

    constructor(address _token) {
        token = TokenWrapper(_token);
    }

    modifier validNonce(uint256 _nonce) {
        require(_nonce > lastNonce[msg.sender], "Invalid nonce");
        _;
        lastNonce[msg.sender] = _nonce;
    }

    function lockTokens(
        address _receiver,
        uint256 _amount,
        string calldata _toChain,
        uint256 _nonce
    ) external nonReentrant whenNotPaused validNonce(_nonce) {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens to bridge
        token.transferFrom(msg.sender, address(this), _amount);
        
        emit TokensLocked(
            msg.sender,
            _receiver,
            _amount,
            _nonce,
            "amoy",
            _toChain
        );
    }

    function unlockTokens(
        address _receiver,
        uint256 _amount,
        bytes32 _txHash,
        bytes calldata _signature
    ) external nonReentrant whenNotPaused onlyOwner {
        require(!processedHashes[_txHash], "Transaction already processed");
        require(verifySignature(_txHash, _signature), "Invalid signature");
        
        processedHashes[_txHash] = true;
        token.transfer(_receiver, _amount);
        
        emit TokensUnlocked(_receiver, _amount, _txHash);
    }

    function lockNFT(
        address _receiver,
        uint256 _tokenId,
        string calldata _toChain,
        uint256 _nonce
    ) external nonReentrant whenNotPaused validNonce(_nonce) {
        token.transferNFTFrom(msg.sender, address(this), _tokenId);
        
        emit NFTLocked(
            msg.sender,
            _receiver,
            _tokenId,
            _nonce,
            "amoy",
            _toChain
        );
    }

    function unlockNFT(
        address _receiver,
        uint256 _tokenId,
        bytes32 _txHash,
        bytes calldata _signature
    ) external nonReentrant whenNotPaused onlyOwner {
        require(!processedHashes[_txHash], "Transaction already processed");
        require(verifySignature(_txHash, _signature), "Invalid signature");
        
        processedHashes[_txHash] = true;
        token.transferNFT(_receiver, _tokenId);
        
        emit NFTUnlocked(_receiver, _tokenId, _txHash);
    }

    function verifySignature(
        bytes32 _txHash,
        bytes calldata _signature
    ) internal view returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_txHash));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(_signature);
        return signer == owner();
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}