//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// Fundraising contract
// Investment is collected and given in arbitrarily sized caps
// Investment is rewarded in the contract's tokens -> project shares

contract Fund is ERC20, Ownable {
    address public currency;

    uint256 public currentCapIndex; // starts at zero and increases by one each time a cap is reached
    uint256 public feeNumerator;
    uint256 public feeDenominator;

    uint256[] public capSizes; // amount of currency tokens each cap can accept
    uint256[] public capDeadlines; // timestamp at which each cap stops accepting investment and closes
    uint256[] public capTotals; // total amount contributed to each cap
    uint256[] public capFeeTotals; // fees collected from each cap

    mapping(uint256 => mapping(address => uint256)) investments; // cap index => account => their investment
    mapping(uint256 => mapping(address => uint256)) fees; // cap index => account => their fees
    mapping(uint256 => bool) public withdrawn;
    mapping(address => bool) public whitelist;

    event Investment(uint256 amount, address investor);
    event InvestmentWithdrawal(uint256 amount);
    event StaleInvestmentWithdrawal(address withdrawer, uint256 amount);
    event ProjectShareWithdrawal(address withdrawer, uint256 amount);

    modifier currentCapExpired(bool status) {
        bool expired = capDeadlines[currentCapIndex] > block.timestamp;
        require(expired == status);
        _;
    }

    constructor(
        string memory name,
        string memory symbol,
        address currency_,
        uint256[] memory capSizes_,
        uint256[] memory capDeadlines_
    ) ERC20(name, symbol) {
        currency = currency_;
        capSizes = capSizes_;
        capDeadlines = capDeadlines_;
        capTotals = new uint256[](capSizes.length);
        capFeeTotals = new uint256[](capSizes.length);
    }

    // ---------------------- INVESTMENT ----------------------

    // Invest an amount into the project
    // Cannot invest if the current cap has expired and failed to meet its target size
    function deposit(uint256 amount) public currentCapExpired(false) {
        uint256 investment = _addInvestment(amount);
        require(
            IERC20(currency).transferFrom(msg.sender, address(this), investment)
        );
    }

    // Fills up consecutive caps with an amount of currency
    function _addInvestment(uint256 amount) internal returns (uint256) {
        if (capTotals[currentCapIndex] + amount < capSizes[currentCapIndex]) {
            capTotals[currentCapIndex] += amount;
            investments[currentCapIndex][msg.sender] += amount;
            return amount;
        } else {
            uint256 remaining = capSizes[currentCapIndex] -
                capTotals[currentCapIndex];
            capTotals[currentCapIndex] += remaining;
            investments[currentCapIndex][msg.sender] += remaining;
            bool lastCap = currentCapIndex == capSizes.length - 1;
            currentCapIndex += 1;
            return
                remaining + (lastCap ? 0 : _addInvestment(amount - remaining));
        }
    }

    // ---------------------- WITHDRAWALS ----------------------

    // Fund owner withdraws successfully filled caps
    function withdrawInvestment() public {
        for (uint256 i = 0; i < capSizes.length; i++) {
            if (i < currentCapIndex) {
                IERC20(currency).transfer(owner(), capTotals[i]);
                capTotals[i] = 0;
            }
        }
    }

    // Withdraw share tokens from investment that contributed to a successful cap
    function withdrawShares() public {
        for (uint256 i = 0; i < capSizes.length; i++) {
            if (i < currentCapIndex) {
                _mint(msg.sender, investments[i][msg.sender]);
                investments[i][msg.sender] = 0;
            }
        }
    }

    // Withdraw investment made into an unsuccessul caps
    function withdrawStaleInvestment() public currentCapExpired(true) {
        uint256 total = investments[currentCapIndex][msg.sender] +
            fees[currentCapIndex][msg.sender];
        IERC20(currency).transfer(msg.sender, total);
        investments[currentCapIndex][msg.sender] = 0;
        fees[currentCapIndex][msg.sender] = 0;
    }

    // ----------------OTHER------------------------------------

    function approveAddress(address who) public onlyOwner {
        whitelist[who] = true;
    }
}
