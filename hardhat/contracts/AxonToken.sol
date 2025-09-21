
//SPDX-License-Identifier: MIT

//this is our token contract

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract AxonToken is ERC20, Ownable {
  uint public initialSupply = 1000000000 * (10 ** 18); // 1 billion tokens with 18 decimals

  constructor(address initialOwner) ERC20("Axon Token", "AXON") Ownable(initialOwner) { //this sets our token name in the first param and the symbol on the second param
    _mint(msg.sender, initialSupply);
  }
  
}