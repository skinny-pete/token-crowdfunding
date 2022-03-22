//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Fund is ERC20 {
    address public projectDeveloper;
    address private owner;
    address feeTo;

    uint feeNumerator = 3;
    uint feeDenominator = 100;

    address public currency;
    uint256[] public capsAmount;
    uint256[] public capsTime;

    mapping(address => bool) whitelist;

    // mapping(address => uint) contribution
    uint256 public totalContributions;
    uint256 withdrawn = 0;
    uint256 public currentCap = 0;

    uint256 public mintingRate;

    event Deposit(uint256 amount, address depositor);
    event Withdrawl(uint256 amount);

    constructor(
        address _feeTo,
        address _projectDeveloper,
        address _currency,
        uint256[] memory _capsAmount,
        uint[] memory _capsTime
    ) ERC20("Fund", "FND") {
        feeTo = _feeTo;
        projectDeveloper = _projectDeveloper;
        currency = _currency;
        capsAmount = _capsAmount;
        capsTime = _capsTime;
        totalContributions = 0;
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier whitelisted() {
        require(whitelist[msg.sender], "Address not permitted");
        _;
    }

    function closed() public view returns (bool) {
        return
            (block.timestamp >= capsTime[currentCap] &&
                totalContributions <= capsAmount[currentCap]) ||
            totalContributions >= capsAmount[capsAmount.length - 1];
    }

    function applyFee(uint amount) internal view returns (uint) {
        return (amount * feeNumerator) / feeDenominator;
    }

    function deposit(uint256 amount) public whitelisted returns (bool) {
        require(!closed(), "This project is closed");
        require(
            IERC20(currency).transferFrom(msg.sender, address(this), amount)
        );
        if (currentCap < capsAmount.length - 1) {
            require(
                amount <= capsAmount[currentCap + 1] - totalContributions,
                "Deposit too large, please make two transactions"
            );
        }

        if (currentCap == capsAmount.length - 1) {
            require(
                amount <=
                    capsAmount[capsAmount.length - 1] - totalContributions,
                "This deposit would exceed max cap"
            );
        }

        uint feeCollected = applyFee(amount);
        IERC20(currency).transfer(feeTo, feeCollected);

        uint256 toMint;
        if (totalContributions == 0) {
            toMint = 10**18;
            mintingRate = amount;
        } else {
            toMint = (amount * 10**18) / mintingRate;
        }

        totalContributions += amount;
        if (totalContributions >= capsAmount[currentCap]) {
            currentCap = currentCap < capsAmount.length - 1
                ? currentCap + 1
                : currentCap;
        }

        _mint(msg.sender, toMint);

        emit Deposit(amount, msg.sender); //TODO emit event with full amount, or amount minus fee?

        return true;
    }

    function withdraw() public returns (bool) {
        require(
            msg.sender == projectDeveloper,
            "Only project developer may withdraw"
        );
        require(currentCap > 0, "Cannot withdraw until secondary cap reached");

        if (currentCap == capsAmount.length - 1) {
            //If have reached last cap - release all remaining funds
            uint balance = IERC20(currency).balanceOf(address(this));
            IERC20(currency).transfer(projectDeveloper, balance);
        } else {
            //Otherwise transfer the last complete cap
            IERC20(currency).transfer(
                projectDeveloper,
                capsAmount[currentCap - 1] - withdrawn
            );
            withdrawn += capsAmount[currentCap - 1] - withdrawn;
        }

        return true;
    }

    function approveAddress(address toApprove) public onlyOwner {
        whitelist[toApprove] = true;
    }

    function setFeeTo(address newFeeTo) public onlyOwner {
        feeTo = newFeeTo;
    }

    function setFee(uint numerator, uint denominator) public onlyOwner {
        feeNumerator = numerator;
        feeDenominator = denominator;
    }
}
