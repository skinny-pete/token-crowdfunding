const { ethers } = require("hardhat");
const hre = require("hardhat");


async function main() {

    let toFund = "0x8555451b1D5Cafa760cd58B919273B14FE156de6"
    const amount = 100000
    const private_key = "797c232d058a2d275d4fdcb688697bba503debe9a31caa9a3523ed34f46a431d"
    let tokenAddress = "0x5C02AFABBF918049b2ad61dbCd0Bc33B5c655Eb9"


    let provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.matic.today")
    const signer = new ethers.Wallet(private_key, provider);

    let stableAbi = ["function mint(address to, uint amount) public returns (bool)"]

    let stable = new ethers.Contract(tokenAddress, stableAbi, signer)

    let overrides = {
        gasPrice: 30000000000,
        gasLimit: 3000000
    }

    let tx = await stable.mint(toFund, ethers.utils.parseEther(amount), overrides)
    console.log("Minted ", amount, " Tokens to address ", toFund)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });