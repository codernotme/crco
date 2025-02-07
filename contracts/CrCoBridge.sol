// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./CrCoToken.sol";

contract CrCoBridge is ReentrancyGuard, AccessControl, Pausable {
    bytes32 public constant RELAYER_ROLE = keccak256("RELAYER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    
    CrCoToken public token;
    uint256 public nonce;
    uint256 public chainId;
    
    // Rate limiting
    mapping(address => uint256) public lastTransferTime;
    mapping(address => uint256) public transferCount;
    uint256 public constant RATE_LIMIT_INTERVAL = 1 minutes;
    uint256 public constant MAX_TRANSFERS_PER_INTERVAL = 10;
    
    // Transfer limits
    mapping(address => uint256) public userVerificationLevel;
    mapping(uint256 => uint256) public levelTransferLimit;
    
    // Batch transfers
    struct BatchTransfer {
        address[] recipients;
        uint256[] amounts;
        bool[] isNFT;
        uint256[] tokenIds;
    }
    
    // Bridge fees
    uint256 public bridgeFee;
    address public feeCollector;
    AggregatorV3Interface public priceFeed;
    
    // Emergency pause
    bool public emergencyPaused;
    
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
        uint256 fee;
        bool requiresTwoFA;
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
        uint256 tokenId,
        uint256 fee
    );
    
    event TransferCompleted(
        bytes32 indexed transferId,
        address indexed recipient,
        uint256 amount,
        bool isNFT,
        uint256 tokenId
    );
    
    event BatchTransferInitiated(
        bytes32 indexed batchId,
        address indexed sender,
        uint256 totalAmount,
        uint256 itemCount
    );
    
    event EmergencyPaused(address indexed admin);
    event EmergencyUnpaused(address indexed admin);
    event BridgeFeeUpdated(uint256 newFee);
    event VerificationLevelUpdated(address indexed user, uint256 newLevel);
    
    modifier whenNotEmergencyPaused() {
        require(!emergencyPaused, "Bridge is emergency paused");
        _;
    }
    
    modifier withinRateLimit(address user) {
        require(
            block.timestamp >= lastTransferTime[user] + RATE_LIMIT_INTERVAL ||
            transferCount[user] < MAX_TRANSFERS_PER_INTERVAL,
            "Rate limit exceeded"
        );
        _;
    }
    
    constructor(
        address _token,
        uint256 _chainId,
        address _priceFeed,
        uint256 _initialBridgeFee
    ) {
        token = CrCoToken(_token);
        chainId = _chainId;
        priceFeed = AggregatorV3Interface(_priceFeed);
        bridgeFee = _initialBridgeFee;
        feeCollector = msg.sender;
        
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(RELAYER_ROLE, msg.sender);
        
        // Set default transfer limits
        levelTransferLimit[0] = 1000 * 10**18; // 1,000 tokens
        levelTransferLimit[1] = 10000 * 10**18; // 10,000 tokens
        levelTransferLimit[2] = 100000 * 10**18; // 100,000 tokens
    }
    
    function initiateTransfer(
        address _recipient,
        uint256 _amount,
        uint256 _destinationChain,
        bool _isNFT,
        uint256 _tokenId
    ) external payable nonReentrant whenNotPaused whenNotEmergencyPaused withinRateLimit(msg.sender) {
        require(_amount > 0 || _isNFT, "Invalid amount");
        require(_destinationChain != chainId, "Invalid destination chain");
        require(msg.value >= bridgeFee, "Insufficient bridge fee");
        
        // Check transfer limits
        if (!_isNFT) {
            require(
                _amount <= levelTransferLimit[userVerificationLevel[msg.sender]],
                "Amount exceeds transfer limit"
            );
        }
        
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
        
        // Update rate limiting
        if (block.timestamp >= lastTransferTime[msg.sender] + RATE_LIMIT_INTERVAL) {
            transferCount[msg.sender] = 1;
        } else {
            transferCount[msg.sender]++;
        }
        lastTransferTime[msg.sender] = block.timestamp;
        
        if (_isNFT) {
            require(!hasTransferredNFT[msg.sender][_tokenId], "NFT already transferred");
            IERC721(address(token)).transferFrom(msg.sender, address(this), _tokenId);
            hasTransferredNFT[msg.sender][_tokenId] = true;
        } else {
            token.burn(msg.sender, _amount);
        }
        
        bool requiresTwoFA = _amount >= levelTransferLimit[userVerificationLevel[msg.sender]] / 2;
        
        transferReceipts[transferId] = TransferReceipt({
            transferId: transferId,
            sender: msg.sender,
            recipient: _recipient,
            amount: _amount,
            timestamp: block.timestamp,
            isNFT: _isNFT,
            tokenId: _tokenId,
            fee: bridgeFee,
            requiresTwoFA: requiresTwoFA
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
            _tokenId,
            bridgeFee
        );
        
        // Transfer fee to collector
        payable(feeCollector).transfer(bridgeFee);
        
        // Refund excess fee
        if (msg.value > bridgeFee) {
            payable(msg.sender).transfer(msg.value - bridgeFee);
        }
        
        nonce++;
    }
    
    function initiateBatchTransfer(
        BatchTransfer calldata _batch,
        uint256 _destinationChain
    ) external payable nonReentrant whenNotPaused whenNotEmergencyPaused {
        require(_batch.recipients.length > 0, "Empty batch");
        require(
            _batch.recipients.length == _batch.amounts.length &&
            _batch.recipients.length == _batch.isNFT.length &&
            _batch.recipients.length == _batch.tokenIds.length,
            "Invalid batch data"
        );
        require(_batch.recipients.length <= 20, "Batch too large");
        require(msg.value >= bridgeFee * _batch.recipients.length, "Insufficient fees");
        
        uint256 totalAmount = 0;
        for (uint256 i = 0; i < _batch.recipients.length; i++) {
            if (!_batch.isNFT[i]) {
                totalAmount += _batch.amounts[i];
            }
        }
        
        bytes32 batchId = keccak256(
            abi.encodePacked(
                msg.sender,
                _destinationChain,
                nonce,
                totalAmount
            )
        );
        
        for (uint256 i = 0; i < _batch.recipients.length; i++) {
            if (_batch.isNFT[i]) {
                IERC721(address(token)).transferFrom(msg.sender, address(this), _batch.tokenIds[i]);
                hasTransferredNFT[msg.sender][_batch.tokenIds[i]] = true;
            }
        }
        
        if (totalAmount > 0) {
            token.burn(msg.sender, totalAmount);
        }
        
        emit BatchTransferInitiated(
            batchId,
            msg.sender,
            totalAmount,
            _batch.recipients.length
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
        uint256 _tokenId,
        bytes calldata _signature
    ) external nonReentrant whenNotPaused whenNotEmergencyPaused onlyRole(RELAYER_ROLE) {
        bytes32 transferId = keccak256(
            abi.encodePacked(_recipient, _amount, _nonce, _isNFT, _tokenId)
        );
        
        require(!processedTransfers[transferId], "Transfer already processed");
        require(
            MerkleProof.verify(_proof, _root, transferId),
            "Invalid proof"
        );
        
        // Verify signature for high-value transfers
        if (_amount >= levelTransferLimit[userVerificationLevel[_recipient]] / 2) {
            require(
                verifySignature(transferId, _signature, _recipient),
                "Invalid signature"
            );
        }
        
        processedTransfers[transferId] = true;
        
        if (_isNFT) {
            IERC721(address(token)).transferFrom(address(this), _recipient, _tokenId);
            hasTransferredNFT[_recipient][_tokenId] = false;
        } else {
            token.mint(_recipient, _amount);
        }
        
        emit TransferCompleted(transferId, _recipient, _amount, _isNFT, _tokenId);
    }
    
    function setTransferRoot(uint256 _nonce, bytes32 _root) 
        external 
        onlyRole(RELAYER_ROLE) 
    {
        transferRoot[_nonce] = _root;
    }
    
    function setBridgeFee(uint256 _newFee) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        bridgeFee = _newFee;
        emit BridgeFeeUpdated(_newFee);
    }
    
    function setUserVerificationLevel(address _user, uint256 _level) 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        require(_level <= 2, "Invalid level");
        userVerificationLevel[_user] = _level;
        emit VerificationLevelUpdated(_user, _level);
    }
    
    function pauseEmergency() 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        emergencyPaused = true;
        emit EmergencyPaused(msg.sender);
    }
    
    function unpauseEmergency() 
        external 
        onlyRole(ADMIN_ROLE) 
    {
        emergencyPaused = false;
        emit EmergencyUnpaused(msg.sender);
    }
    
    function getTransferReceipt(bytes32 _transferId) 
        external 
        view 
        returns (TransferReceipt memory) 
    {
        return transferReceipts[_transferId];
    }
    
    function getLatestPrice() 
        public 
        view 
        returns (int) 
    {
        (
            ,
            int price,
            ,
            ,
        ) = priceFeed.latestRoundData();
        return price;
    }
    
    function verifySignature(
        bytes32 _transferId,
        bytes memory _signature,
        address _signer
    ) internal pure returns (bool) {
        bytes32 messageHash = keccak256(abi.encodePacked(_transferId));
        bytes32 ethSignedMessageHash = keccak256(
            abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)
        );
        
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        address recoveredSigner = ecrecover(ethSignedMessageHash, v, r, s);
        
        return recoveredSigner == _signer;
    }
    
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (bytes32 r, bytes32 s, uint8 v)
    {
        require(sig.length == 65, "Invalid signature length");
        
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}