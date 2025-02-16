// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./Pausable.sol";

contract BridgeOracle is Pausable {
    mapping(address => bool) public authorizedOracles;
    mapping(bytes32 => bool) public processedOperations;
    mapping(bytes32 => uint8) public operationConfirmations;
    
    uint8 public requiredConfirmations;
    
    event OperationConfirmed(bytes32 indexed operationId, address indexed oracle);
    event OperationProcessed(bytes32 indexed operationId);
    event OracleAuthorized(address indexed oracle);
    event OracleDeauthorized(address indexed oracle);
    
    constructor(uint8 _requiredConfirmations) {
        require(_requiredConfirmations > 0, "Required confirmations must be > 0");
        requiredConfirmations = _requiredConfirmations;
        authorizedOracles[msg.sender] = true;
        emit OracleAuthorized(msg.sender);
    }
    
    modifier onlyOracle() {
        require(authorizedOracles[msg.sender], "Not authorized oracle");
        _;
    }
    
    function confirmOperation(bytes32 operationId) external onlyOracle whenNotPaused {
        require(!processedOperations[operationId], "Operation already processed");
        
        operationConfirmations[operationId]++;
        emit OperationConfirmed(operationId, msg.sender);
        
        if (operationConfirmations[operationId] >= requiredConfirmations) {
            processedOperations[operationId] = true;
            emit OperationProcessed(operationId);
        }
    }
    
    function isOperationConfirmed(bytes32 operationId) external view returns (bool) {
        return processedOperations[operationId];
    }
    
    function addOracle(address oracle) external onlyOwner {
        require(oracle != address(0), "Invalid oracle address");
        require(!authorizedOracles[oracle], "Oracle already authorized");
        
        authorizedOracles[oracle] = true;
        emit OracleAuthorized(oracle);
    }
    
    function removeOracle(address oracle) external onlyOwner {
        require(authorizedOracles[oracle], "Oracle not authorized");
        
        authorizedOracles[oracle] = false;
        emit OracleDeauthorized(oracle);
    }
    
    function updateRequiredConfirmations(uint8 _requiredConfirmations) external onlyOwner {
        require(_requiredConfirmations > 0, "Required confirmations must be > 0");
        requiredConfirmations = _requiredConfirmations;
    }
}