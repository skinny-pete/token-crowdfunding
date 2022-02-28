# Crowdfunding Contracts

## Installations
`npm install --save-dev hardhat`  
  
`npm install --save-dev @nomiclabs/hardhat-waffle ethereum-waffle chai @nomiclabs/hardhat-ethers ethers`
  
`npm install @openzeppelin/contracts`

## Running
To run tests:
`npx hardhat test`

To deploy:
`npx hardhat run scripts/deploy.js --network [NETWORK_NAME]`

Options for NETWORK_NAME are currently:  
`localhost` - for deploying to an already running hardhat node  
`ropsten` - for deploying to the ropsten public testnet using the private key included in hardhat.config.js  


To start a hardhat node, the command is `npx hardhat node`  



