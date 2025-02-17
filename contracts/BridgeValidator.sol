// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Pausable.sol";

contract BridgeValidator is Pausable {
    mapping(address => bool) public validators;
    mapping(bytes32 => mapping(address => bool)) public validations;
    mapping(bytes32 => uint256) public validationCounts;
    
    uint256 public requiredValidations;
    uint256 public validationTimeout;
    
    event OperationValidated(bytes32 indexed operationId, address indexed validator);
    event ValidationComplete(bytes32 indexed operationId);
    event ValidatorAdded(address indexed validator);
    event ValidatorRemoved(address indexed validator);
    
    constructor(uint256 _requiredValidations, uint256 _validationTimeout) {
        require(_requiredValidations > 0, "Invalid required validations");
        require(_validationTimeout > 0, "Invalid validation timeout");
        requiredValidations = _requiredValidations;
        validationTimeout = _validationTimeout;
        validators[msg.sender] = true;
        emit ValidatorAdded(msg.sender);
    }
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Not authorized validator");
        _;
    }
    
    function validateOperation(
        bytes32 operationId,
        address token,
        address from,
        uint256 amount,
        uint256 timestamp
    ) external onlyValidator whenNotPaused {
        require(!validations[operationId][msg.sender], "Already validated");
        require(
            block.timestamp <= timestamp + validationTimeout,
            "Validation timeout"
        );
        
        // Verify operation hash
        bytes32 hash = keccak256(
            abi.encodePacked(operationId, token, from, amount, timestamp)
        );
        require(hash == operationId, "Invalid operation hash");
        
        validations[operationId][msg.sender] = true;
        validationCounts[operationId]++;
        
        emit OperationValidated(operationId, msg.sender);
        
        if (validationCounts[operationId] >= requiredValidations) {
            emit ValidationComplete(operationId);
        }
    }
    
    function isOperationValid(bytes32 operationId) external view returns (bool) {
        return validationCounts[operationId] >= requiredValidations;
    }
    
    function addValidator(address validator) external onlyOwner {
        require(validator != address(0), "Invalid validator address");
        require(!validators[validator], "Validator already exists");
        validators[validator] = true;
        emit ValidatorAdded(validator);
    }
    
    function removeValidator(address validator) external onlyOwner {
        require(validators[validator], "Validator doesn't exist");
        validators[validator] = false;
        emit ValidatorRemoved(validator);
    }
    
    function updateRequiredValidations(uint256 _requiredValidations) external onlyOwner {
        require(_requiredValidations > 0, "Invalid required validations");
        requiredValidations = _requiredValidations;
    }
    
    function updateValidationTimeout(uint256 _validationTimeout) external onlyOwner {
        require(_validationTimeout > 0, "Invalid validation timeout");
        validationTimeout = _validationTimeout;
    }
}