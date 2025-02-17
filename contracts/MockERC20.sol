// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./custom/ERC20.sol";
import "./custom/Ownable.sol";

contract MockERC20 is ERC20, Ownable {
    constructor(
        string memory name,
        string memory symbol
    ) ERC20(name, symbol) Ownable(msg.sender) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
}