# Crowdfunding

## Scripts
`--network` flag tells hardhat which network (defined in hardhat.config.js) to interact on

### Funding/Minting

`npx hardhat run scripts/fund.js --network mumbai` - This will mint tokens to an account assuming the private key provided is an account with permission to do so
You should adjust the following consts in the script: 
|value|description|
|-----------|----------|
|`toFund: string` | address you want to mint tokens to|
|`private_key: string` | the private key of the account you want to call the contract from|
|`amount: number` | the number of tokens you want to mint (don't multiply by 10**18, script |converts it)|
|`tokenAddress: string` | the contract address of the token you want to mint|



### Approving account
`npx hardhat run scripts/approve_account.js --network mumbai` - This approves an account to interact with the contract 

Adjust the following consts:
|value|description|
|-----------|----------|
|`toApprove: string` | address you want to approve|
|`private_key: string` | the private key of the account you want to call the contract from|
|`fundAddress: string` | the address of the fund contract|


