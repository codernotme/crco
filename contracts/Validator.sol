// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract Validator is Ownable, Pausable {
    using ECDSA for bytes32;

    mapping(address => bool) public validators;
    uint256 public requiredSignatures;
    mapping(bytes32 => mapping(address => bool)) public hasValidated;
    mapping(bytes32 => uint256) public validationCount;

    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    event RequiredSignaturesUpdated(uint256 newRequired);
    event TransactionValidated(bytes32 indexed txHash, address indexed validator);
    event ValidationComplete(bytes32 indexed txHash);

    constructor(uint256 _requiredSignatures) {
        requiredSignatures = _requiredSignatures;
        validators[msg.sender] = true;
        emit ValidatorAdded(msg.sender);
    }

    modifier onlyValidator() {
        require(validators[msg.sender], "Not a validator");
        _;
    }

    function addValidator(address _validator) external onlyOwner {
        require(!validators[_validator], "Already a validator");
        validators[_validator] = true;
        emit ValidatorAdded(_validator);
    }

    function removeValidator(address _validator) external onlyOwner {
        require(validators[_validator], "Not a validator");
        validators[_validator] = false;
        emit ValidatorRemoved(_validator);
    }

    function setRequiredSignatures(uint256 _required) external onlyOwner {
        require(_required > 0, "Required signatures must be > 0");
        requiredSignatures = _required;
        emit RequiredSignaturesUpdated(_required);
    }

    function validateTransaction(
        bytes32 _txHash,
        bytes calldata _signature
    ) external onlyValidator whenNotPaused returns (bool) {
        require(!hasValidated[_txHash][msg.sender], "Already validated");
        
        bytes32 messageHash = keccak256(abi.encodePacked(_txHash));
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedMessageHash.recover(_signature);
        
        require(signer == msg.sender, "Invalid signature");
        
        hasValidated[_txHash][msg.sender] = true;
        validationCount[_txHash]++;
        
        emit TransactionValidated(_txHash, msg.sender);
        
        if (validationCount[_txHash] >= requiredSignatures) {
            emit ValidationComplete(_txHash);
            return true;
        }
        
        return false;
    }

    function isValidated(bytes32 _txHash) external view returns (bool) {
        return validationCount[_txHash] >= requiredSignatures;
    }

    function getValidationCount(bytes32 _txHash) external view returns (uint256) {
        return validationCount[_txHash];
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}