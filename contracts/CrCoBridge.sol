// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "./CrCoToken.sol";

contract CrCoBridge is ReentrancyGuard, AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    
    CrCoToken public token;
    
    uint256 public nonce;
    uint256 public chainId;
    
    mapping(bytes32 => bool) public processedTransfers;
    mapping(uint256 => bytes32) public transferRoot;
    
    event TransferInitiated(
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 nonce,
        uint256 sourceChain,
        uint256 destinationChain
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed recipient,
        uint256 amount
    );
    
    constructor(address _token, uint256 _chainId) {
        token = CrCoToken(_token);
        chainId = _chainId;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
    }
    
    function initiateTransfer(
        address _recipient,
        uint256 _amount,
        uint256 _destinationChain
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        require(_destinationChain != chainId, "Invalid destination chain");
        
        token.burn(msg.sender, _amount);
        
        emit TransferInitiated(
            msg.sender,
            _recipient,
            _amount,
            nonce,
            chainId,
            _destinationChain
        );
        
        nonce++;
    }
    
    function completeTransfer(
        bytes32[] calldata _proof,
        bytes32 _root,
        address _recipient,
        uint256 _amount,
        uint256 _nonce
    ) external nonReentrant onlyRole(RELAYER_ROLE) {
        bytes32 transferId = keccak256(
            abi.encodePacked(_recipient, _amount, _nonce)
        );
        
        require(!processedTransfers[transferId], "Transfer already processed");
        require(
            MerkleProof.verify(_proof, _root, transferId),
            "Invalid proof"
        );
        
        processedTransfers[transferId] = true;
        token.mint(_recipient, _amount);
        
        emit TransferCompleted(transferId, _recipient, _amount);
    }
    
    function setTransferRoot(uint256 _nonce, bytes32 _root) 
        external 
        onlyRole(RELAYER_ROLE) 
    {
        transferRoot[_nonce] = _root;
    }
}