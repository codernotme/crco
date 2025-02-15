// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract CrCoBridge is ReentrancyGuard, AccessControl {
    bytes32 public constant BRIDGE_ROLE = keccak256("BRIDGE_ROLE");
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    
    enum AssetType { ERC20, ERC721 }
    enum ChainType { AMOY_TESTNET, SEPOLIA_TESTNET }
    
    uint256 public constant BRIDGE_FEE = 0.001 ether; // 0.1% fee
    uint256 public constant MAX_TRANSFER_AMOUNT = 1000000 ether;
    uint256 public constant MIN_TRANSFER_AMOUNT = 0.01 ether;
    
    // Nonce tracking for replay protection
    mapping(address => uint256) public nonces;
    
    // Transfer receipt mapping
    mapping(bytes32 => bool) public processedTransfers;
    
    // Locked tokens tracking
    mapping(address => mapping(address => uint256)) public lockedTokens;
    mapping(address => mapping(uint256 => address)) public lockedNFTs;
    
    // Events
    event AssetLocked(
        bytes32 indexed transferId,
        address indexed token,
        address indexed sender,
        uint256 amount,
        AssetType assetType,
        ChainType sourceChain,
        ChainType targetChain,
        address receiver,
        uint256 timestamp
    );
    
    event AssetUnlocked(
        bytes32 indexed transferId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        AssetType assetType,
        uint256 timestamp
    );
    
    event AssetMinted(
        bytes32 indexed transferId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        AssetType assetType,
        uint256 timestamp
    );
    
    event AssetBurned(
        bytes32 indexed transferId,
        address indexed token,
        address indexed sender,
        uint256 amount,
        AssetType assetType,
        uint256 timestamp
    );
    
    event CrossChainTransferInitiated(
        bytes32 indexed transferId,
        address indexed token,
        address indexed sender,
        uint256 amount,
        AssetType assetType,
        ChainType sourceChain,
        ChainType targetChain,
        address receiver,
        uint256 nonce,
        uint256 timestamp
    );
    
    event CrossChainTransferCompleted(
        bytes32 indexed transferId,
        address indexed token,
        address indexed recipient,
        uint256 amount,
        AssetType assetType,
        uint256 timestamp
    );

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(BRIDGE_ROLE, msg.sender);
        _grantRole(OPERATOR_ROLE, msg.sender);
    }

    modifier validChain(ChainType chain) {
        require(uint256(chain) <= uint256(ChainType.SEPOLIA_TESTNET), "Invalid chain");
        _;
    }

    modifier validTransferAmount(uint256 amount, AssetType assetType) {
        if (assetType == AssetType.ERC20) {
            require(amount >= MIN_TRANSFER_AMOUNT, "Amount too small");
            require(amount <= MAX_TRANSFER_AMOUNT, "Amount too large");
        }
        _;
    }

    // Lock and Mint function
    function lockAndMint(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        address receiverAddress,
        ChainType sourceChain,
        ChainType targetChain
    ) external payable nonReentrant validChain(sourceChain) validChain(targetChain) validTransferAmount(amount, assetType) {
        require(msg.value >= BRIDGE_FEE, "Insufficient bridge fee");
        require(assetAddress != address(0), "Invalid asset address");
        require(receiverAddress != address(0), "Invalid receiver address");
        require(sourceChain != targetChain, "Source and target chains must differ");

        bytes32 transferId = keccak256(
            abi.encodePacked(
                msg.sender,
                receiverAddress,
                amount,
                assetType,
                sourceChain,
                targetChain,
                nonces[msg.sender]++,
                block.timestamp
            )
        );

        if (assetType == AssetType.ERC20) {
            require(
                IERC20(assetAddress).transferFrom(msg.sender, address(this), amount),
                "Token transfer failed"
            );
            lockedTokens[assetAddress][msg.sender] += amount;
        } else {
            IERC721(assetAddress).transferFrom(msg.sender, address(this), amount);
            lockedNFTs[assetAddress][amount] = msg.sender;
        }

        emit AssetLocked(
            transferId,
            assetAddress,
            msg.sender,
            amount,
            assetType,
            sourceChain,
            targetChain,
            receiverAddress,
            block.timestamp
        );
    }

    // Unlock and Burn function
    function unlockAndBurn(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) external nonReentrant validTransferAmount(amount, assetType) {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(verifyTransfer(transferId, merkleProof), "Invalid proof");
        require(assetAddress != address(0), "Invalid asset address");

        processedTransfers[transferId] = true;

        if (assetType == AssetType.ERC20) {
            require(
                lockedTokens[assetAddress][msg.sender] >= amount,
                "Insufficient locked tokens"
            );
            lockedTokens[assetAddress][msg.sender] -= amount;
            require(
                IERC20(assetAddress).transfer(msg.sender, amount),
                "Token transfer failed"
            );
        } else {
            require(
                lockedNFTs[assetAddress][amount] == msg.sender,
                "Not the original NFT owner"
            );
            delete lockedNFTs[assetAddress][amount];
            IERC721(assetAddress).transferFrom(address(this), msg.sender, amount);
        }

        emit AssetUnlocked(
            transferId,
            assetAddress,
            msg.sender,
            amount,
            assetType,
            block.timestamp
        );
    }

    // Cross-Chain Transfer function
    function initiateCrossChainTransfer(
        AssetType assetType,
        address assetAddress,
        ChainType sourceChain,
        ChainType targetChain,
        uint256 amount,
        address receiverAddress
    ) external payable nonReentrant validChain(sourceChain) validChain(targetChain) validTransferAmount(amount, assetType) {
        require(msg.value >= BRIDGE_FEE, "Insufficient bridge fee");
        require(assetAddress != address(0), "Invalid asset address");
        require(receiverAddress != address(0), "Invalid receiver address");
        require(sourceChain != targetChain, "Source and target chains must differ");

        bytes32 transferId = keccak256(
            abi.encodePacked(
                msg.sender,
                receiverAddress,
                amount,
                assetType,
                sourceChain,
                targetChain,
                nonces[msg.sender],
                block.timestamp
            )
        );

        if (assetType == AssetType.ERC20) {
            require(
                IERC20(assetAddress).transferFrom(msg.sender, address(this), amount),
                "Token transfer failed"
            );
        } else {
            IERC721(assetAddress).transferFrom(msg.sender, address(this), amount);
        }

        emit CrossChainTransferInitiated(
            transferId,
            assetAddress,
            msg.sender,
            amount,
            assetType,
            sourceChain,
            targetChain,
            receiverAddress,
            nonces[msg.sender]++,
            block.timestamp
        );
    }

    // Complete Cross-Chain Transfer
    function completeCrossChainTransfer(
        AssetType assetType,
        address assetAddress,
        uint256 amount,
        address receiverAddress,
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) external nonReentrant onlyRole(OPERATOR_ROLE) {
        require(!processedTransfers[transferId], "Transfer already processed");
        require(verifyTransfer(transferId, merkleProof), "Invalid proof");
        
        processedTransfers[transferId] = true;

        if (assetType == AssetType.ERC20) {
            require(
                IERC20(assetAddress).transfer(receiverAddress, amount),
                "Token transfer failed"
            );
        } else {
            IERC721(assetAddress).transferFrom(
                address(this),
                receiverAddress,
                amount
            );
        }

        emit CrossChainTransferCompleted(
            transferId,
            assetAddress,
            receiverAddress,
            amount,
            assetType,
            block.timestamp
        );
    }

    // Verify transfer using Merkle proof
    function verifyTransfer(
        bytes32 transferId,
        bytes32[] calldata merkleProof
    ) public pure returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(transferId));
        bytes32 root = merkleProof[0]; // For demo, using first proof element as root
        return MerkleProof.verify(merkleProof, root, leaf);
    }

    // Emergency functions
    function emergencyWithdraw(
        address token,
        address recipient,
        uint256 amount
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(
            IERC20(token).transfer(recipient, amount),
            "Emergency withdrawal failed"
        );
    }

    function emergencyWithdrawNFT(
        address nftContract,
        address recipient,
        uint256 tokenId
    ) external onlyRole(DEFAULT_ADMIN_ROLE) {
        IERC721(nftContract).transferFrom(address(this), recipient, tokenId);
    }

    // Withdraw collected fees
    function withdrawFees() external onlyRole(DEFAULT_ADMIN_ROLE) {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        payable(msg.sender).transfer(balance);
    }

    // Receive function to accept ETH
    receive() external payable {}
}