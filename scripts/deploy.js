// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

// const toFund = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266"
const projectDeveloper = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
let caps = ["100", "1000", "20000"].map(x => ethers.utils.parseEther(x))

let toFund = "0x466f52132552FB541723A11f97cf8d44f009e975"
// const private_key = "797c232d058a2d275d4fdcb688697bba503debe9a31caa9a3523ed34f46a431d"


async function main() {

  

  // We get the contract to deploy
  const Stable = await hre.ethers.getContractFactory("TestToken");
  const stable = await Stable.deploy(toFund, ethers.utils.parseEther("100000"));

  await stable.deployed();

  console.log("Stable deployed to:", stable.address);

  // let stableAddress = "0xf16407F8F817c13441C62EEE8F1936BBA752B06c"

  const Fund = await hre.ethers.getContractFactory("Fund")
  const fund = await Fund.deploy(projectDeveloper, stable.address, caps)

  console.log("Fund deployed to: ", fund.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
