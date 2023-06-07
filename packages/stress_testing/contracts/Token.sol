// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    constructor() ERC20("Stress Token", "ST") {}

    // so that every account "has some balance", without the need to manually distribute tokens
    function balanceOf(
        address account
    ) public view virtual override returns (uint256) {
        return uint256(uint160(account));
    }
}
