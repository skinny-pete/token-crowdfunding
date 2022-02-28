//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Fund is ERC20 {
    address public projectDeveloper;

    address public currency;
    uint256[] public caps;

    // mapping(address => uint) contribution
    uint256 public totalContributions;
    uint256 withdrawn = 0;
    uint256 public currentCap = 0;

    uint256 public mintingRate;

    event Deposit(uint256 amount, address depositor);
    event Withdrawl(uint256 amount);

    constructor(
        address _projectDeveloper,
        address _currency,
        uint256[] memory _caps
    ) ERC20("Fund", "FND") {
        projectDeveloper = _projectDeveloper;
        currency = _currency;
        caps = _caps;
        totalContributions = 0;
    }

    function deposit(uint256 amount) public returns (bool) {
        require(
            IERC20(currency).transferFrom(msg.sender, address(this), amount)
        );
        require(
            totalContributions < caps[caps.length - 1],
            "Already at max cap"
        );
        if (currentCap < caps.length-1) {
            require(
                amount <= caps[currentCap+1] - totalContributions,
                "Deposit too large, please make two transactions"
            );
        }

        if(currentCap == caps.length-1) {
            require(amount <= caps[caps.length-1] - totalContributions, 
            "This deposit would exceed max cap");
        }

        uint256 toMint;
        if (totalContributions == 0) {
            toMint = 10**18;
            mintingRate = amount;
        } else {
            toMint = (amount * 10**18) / mintingRate;
        }

        totalContributions += amount;
        if (totalContributions >= caps[currentCap]) {
            currentCap = currentCap < caps.length-1 ? currentCap+1 : currentCap;
        }

        _mint(msg.sender, toMint);

        emit Deposit(amount, msg.sender);

        return true;
    }

    function withdraw() public returns (bool) {
        require(
            msg.sender == projectDeveloper,
            "Only project developer may withdraw"
        );
        require(currentCap > 0, "Cannot withdraw until secondary cap reached");
        
        if(currentCap == caps.length-1) { //If have reached last cap - release all remaining funds
            uint balance = IERC20(currency).balanceOf(address(this));
            IERC20(currency).transfer(projectDeveloper, balance);
        }
        // else if (currentCap == 2) {
        //     IERC20(currency).transfer(projectDeveloper, caps[1]);
        //     withdrawn += caps[1];
        // }
        else { //Otherwise transfer the last complete cap
            IERC20(currency).transfer(projectDeveloper, caps[currentCap-1] - withdrawn);
            withdrawn += caps[currentCap - 1] - withdrawn;
        }
        
        return true;
    }
}
