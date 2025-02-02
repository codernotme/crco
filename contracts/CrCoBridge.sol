// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./CrCoToken.sol";

contract CrCoBridge is ReentrancyGuard, AccessControl {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    
    CrCoToken public token;
    uint256 public nonce;
    uint256 public chainId;
    
    mapping(bytes32 => bool) public processedTransfers;
    mapping(uint256 => bytes32) public transferRoot;
    mapping(address => mapping(uint256 => bool)) public hasTransferredNFT;
    
    struct TransferReceipt {
        bytes32 transferId;
        address sender;
        address recipient;
        uint256 amount;
        uint256 timestamp;
        bool isNFT;
        uint256 tokenId;
    }
    
    mapping(bytes32 => TransferReceipt) public transferReceipts;
    
    event TransferInitiated(
        bytes32 indexed transferId,
        address indexed sender,
        address indexed recipient,
        uint256 amount,
        uint256 nonce,
        uint256 sourceChain,
        uint256 destinationChain,
        bool isNFT,
        uint256 tokenId
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed recipient,
        uint256 amount,
        bool isNFT,
        uint256 tokenId
    );
    
    event ProofGenerated(
        bytes32 indexed transferId,
        bytes32 merkleRoot,
        uint256 timestamp
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
        uint256 _destinationChain,
        bool _isNFT,
        uint256 _tokenId
    ) external nonReentrant {
        require(_amount > 0 || _isNFT, "Invalid amount");
        require(_destinationChain != chainId, "Invalid destination chain");
        
        bytes32 transferId = keccak256(
            abi.encodePacked(
                msg.sender,
                _recipient,
                _amount,
                nonce,
                chainId,
                _destinationChain,
                _isNFT,
                _tokenId
            )
        );
        
        require(!processedTransfers[transferId], "Transfer already processed");
        
        if (_isNFT) {
            require(!hasTransferredNFT[msg.sender][_tokenId], "NFT already transferred");
            IERC721(address(token)).transferFrom(msg.sender, address(this), _tokenId);
            hasTransferredNFT[msg.sender][_tokenId] = true;
        } else {
            token.burn(msg.sender, _amount);
        }
        
        transferReceipts[transferId] = TransferReceipt({
            transferId: transferId,
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            timestamp: block.timestamp,
            isNFT: _isNFT,
            tokenId: _tokenId
        });
        
        emit TransferInitiated(
            transferId,
            msg.sender,
            _recipient,
            _amount,
            nonce,
            chainId,
            _destinationChain,
            _isNFT,
            _tokenId
        );
        
        nonce++;
    }
    
    function completeTransfer(
        bytes32[] calldata _proof,
        bytes32 _root,
        address _recipient,
        uint256 _amount,
        uint256 _nonce,
        bool _isNFT,
        uint256 _tokenId
    ) external nonReentrant onlyRole(RELAYER_ROLE) {
        bytes32 transferId = keccak256(
            abi.encodePacked(_recipient, _amount, _nonce, _isNFT, _tokenId)
        );
        
        require(!processedTransfers[transferId], "Transfer already processed");
        require(
            MerkleProof.verify(_proof, _root, transferId),
            "Invalid proof"
        );
        
        processedTransfers[transferId] = true;
        
        if (_isNFT) {
            IERC721(address(token)).transferFrom(address(this), _recipient, _tokenId);
            hasTransferredNFT[_recipient][_tokenId] = false;
        } else {
            token.mint(_recipient, _amount);
        }
        
        emit TransferCompleted(transferId, _recipient, _amount, _isNFT, _tokenId);
        emit ProofGenerated(transferId, _root, block.timestamp);
    }
    
    function setTransferRoot(uint256 _nonce, bytes32 _root) 
        external 
        onlyRole(RELAYER_ROLE) 
    {
        transferRoot[_nonce] = _root;
    }
    
    function getTransferReceipt(bytes32 _transferId) 
        external 
        view 
        returns (TransferReceipt memory) 
    {
        return transferReceipts[_transferId];
    }
}