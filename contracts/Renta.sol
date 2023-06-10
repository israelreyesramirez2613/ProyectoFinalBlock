// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

contract Renta {
address[16] public clientes;

function rentar(uint peliculaID) public payable returns (uint) {
  require(peliculaID >= 0 && peliculaID <= 15);

  clientes[peliculaID] = msg.sender;

  return peliculaID;
}

function getClientes() public view returns (address[16] memory) {
  return clientes;
}
}