require("@nomicfoundation/hardhat-toolbox");

// The next line is part of the sample project, you don't need it in your
// project. It imports a Hardhat task definition, that can be used for
// testing the frontend.
require("./tasks/faucet");
const INFURA_API_KEY = "ce1c49edb9f84fec9e7ef7b6daa3fd64";
const SEPOLIA_PRIVATE_KEY = "f1b842936d041f262649f42ab350ce0b4c346902feaece6105a34812ac212e2c";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  ignition: {
    requiredConfirmations: 1
  },
  networks: {
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/72T53M3PnQ5MU6pjMvDw-NkcPXY5e2qh`,
      accounts: [SEPOLIA_PRIVATE_KEY],
    },
  },
};