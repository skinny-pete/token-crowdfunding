const { ethers } = require("hardhat");
const hre = require("hardhat");

async function main() {
    let toApprove = "0x8555451b1D5Cafa760cd58B919273B14FE156de6";
    const private_key =
        "797c232d058a2d275d4fdcb688697bba503debe9a31caa9a3523ed34f46a431d";
    const fundAddress = "0x87335ff1DF83F5ba02f5f82AfB2001956C427572";

    let provider = new ethers.providers.JsonRpcProvider(
        "https://rpc-mumbai.matic.today"
    );
    const signer = new ethers.Wallet(private_key, provider);

    let fundAbi = ["function approveAddress(address who) public"];

    let stable = new ethers.Contract(fundAddress, fundAbi, signer);

    let overrides = {
        gasPrice: 30000000000,
        gasLimit: 3000000,
    };

    let tx = await stable.approveAddress(toApprove, overrides);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });