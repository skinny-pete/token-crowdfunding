const { ethers } = require("ethers");

const provider;



const signer;

const stableAddress = "";
const fundAddress = "";

const stableABI = [
    "function mint(address to, uint256 amount) public"
]

const fundABI = [
    "function deposit(uint256 amount) public returns (bool)",
    "function withdraw(uint256 amount) public returns (bool)",
    "function caps() public view returns (uint[])"
]

const stableContract = new ethers.Contract(stableAddress, stableABI, signer)
const fundContract = new ethers.Contract(fundAddress, fundABI, signer)

const stableOwner = "";
const projectDeveloper = "";

function test() {
    console.log("test")
}

async function connectWallet() {
    provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner()

}

async function deposit(amount) {
    await stableContract.approve(fundAddress, amount)
    await fundContract.deposit(amount)    
}

async function withdraw(amount) {
    await fundContract.connect()
}