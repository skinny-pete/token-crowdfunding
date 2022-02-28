require("@nomiclabs/hardhat-waffle");

task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});


const ROPSTEN_PRIVATE_KEY = "8d9b7db94ffca8090775c3bcc600a7b37cbe97eeba2add683118390f0a5ce9d6" //This is not a default account

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: "0.8.4",
  networks: {
    ropsten: {
      url: "https://ropsten.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
      accounts: ['8d9b7db94ffca8090775c3bcc600a7b37cbe97eeba2add683118390f0a5ce9d6']
    }
  }
};
