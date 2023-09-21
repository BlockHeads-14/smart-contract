require("@nomiclabs/hardhat-waffle");
// require("hardhat-chai");
// require("@nomiclabs/hardhat-etherscan");
// require("@nomiclabs/hardhat-ethers");

// require("@nomicfoundation/hardhat-toolbox");
require("chai");
require("@nomiclabs/hardhat-ethers");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
const { SEPOLIA_PRIVATE_KEY, ALCHEMY_API_KEY, ETHERSCAN_API_KEY } = process.env;
module.exports = {
  solidity: "0.8.18",
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${SEPOLIA_PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
};
