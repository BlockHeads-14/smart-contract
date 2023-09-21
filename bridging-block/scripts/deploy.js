// npx hardhat run scripts/deploy.js --network sepolia

const { ethers, upgrades } = require("hardhat");

async function main() {
  // Get the accounts/signers
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);
  //   console.log("Account balance:", (await deployer.getBalance()).toString());

  // Deploying the BridgingBlock contract
  const BridgingBlock = await ethers.getContractFactory("BridgingBlock");
  const bridgingBlock = await BridgingBlock.deploy();
  await bridgingBlock.deployed();

  console.log("BridgingBlock contract deployed to:", bridgingBlock.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
