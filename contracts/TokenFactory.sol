// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./custom/ERC20.sol";
import "./custom/Ownable.sol";

contract TokenFactory is Ownable {
    event TokenCreated(address indexed token, string name, string symbol);
    
    mapping(address => bool) public isValidToken;
    
    constructor() Ownable(msg.sender) {}
    
    function createToken(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) external returns (address) {
        BridgeToken newToken = new BridgeToken(name, symbol, initialSupply, msg.sender);
        isValidToken[address(newToken)] = true;
        
        emit TokenCreated(address(newToken), name, symbol);
        return address(newToken);
    }
}

contract BridgeToken is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address owner
    ) ERC20(name, symbol) Ownable(owner) {
        _mint(owner, initialSupply);
    }
    
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    
    function burn(address from, uint256 amount) external onlyOwner {
        _burn(from, amount);
    }
}