//npx hardhat run scripts/encodeConstructorArgs.js

const { ethers } = require("hardhat");

async function encodeConstructorArgs() {
  const contractName = "BridgingBlock";

  // Constructor arguments for BridgingBlock contract
  const constructorArgs = [];

  // Load the contract's ABI
  const contractFactory = await ethers.getContractFactory(contractName);
  const contractInterface = contractFactory.interface;

  // Encode the constructor arguments
  const encodedArgs = contractInterface.encodeDeploy(constructorArgs);

  console.log("ABI-encoded constructor arguments:", encodedArgs);
}

encodeConstructorArgs();
