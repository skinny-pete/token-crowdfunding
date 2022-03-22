const { expect } = require("chai");
const { providers, BigNumber } = require("ethers");
const { ethers } = require("hardhat");

const week = 604800;

const amountCaps = ["100", "1000", "20000"].map((x) =>
    ethers.utils.parseEther(x)
);
let timeCaps;
async function setup() {
    const [owner, add1, add2, projectDeveloper, feeCollector] =
    await ethers.getSigners();

    const _stable = await ethers.getContractFactory("TestToken");
    const stable = await _stable.deploy(
        owner.address,
        ethers.utils.parseEther("100000")
    );

    const now = (await ethers.provider.getBlock("latest")).timestamp;

    timeCaps = [now + week, now + 2 * week, now + 3 * week];

    const _fund = await ethers.getContractFactory("Fund");
    const fund = await _fund.deploy(
        feeCollector.address,
        projectDeveloper.address,
        stable.address,
        amountCaps,
        timeCaps
    );

    return {
        stable,
        fund,
        owner,
        add1,
        projectDeveloper,
        feeCollector,
    };
}

describe("Fund", function() {
    it("Should deploy without errors", async() => {
        await setup();
    });
    it("Should allow a stranger to deposit stable, recieving fund tokens in return", async() => {
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();

        await stable
            .connect(owner)
            .mint(add1.address, ethers.utils.parseEther("100"));
        await fund.approveAddress(add1.address);

        firstDeposit = ethers.utils.parseEther("10");
        await stable.connect(add1).approve(fund.address, firstDeposit);

        await expect(() =>
            fund.connect(add1).deposit(firstDeposit)
        ).to.changeTokenBalance(fund, add1, ethers.utils.parseEther("1"));

        secondDeposit = ethers.utils.parseEther("55");
        await stable.connect(add1).approve(fund.address, secondDeposit);
        await expect(() =>
            fund.connect(add1).deposit(secondDeposit)
        ).to.changeTokenBalance(fund, add1, ethers.utils.parseEther("5.5"));
    });
    it("Should not allow the project developer to withdraw funds before the first cap is reached", async() => {
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();

        await stable
            .connect(owner)
            .mint(add1.address, ethers.utils.parseEther("100"));
        await fund.approveAddress(add1.address);

        firstDeposit = ethers.utils.parseEther("10");
        await stable.connect(add1).approve(fund.address, firstDeposit);

        await expect(fund.connect(projectDeveloper).withdraw()).to.be.revertedWith(
            "Cannot withdraw until secondary cap reached"
        );
    });
    it("Should allow the project developer to withdraw funds after first cap has been reached", async() => {
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();

        await stable
            .connect(owner)
            .mint(add1.address, ethers.utils.parseEther("150"));
        await fund.approveAddress(add1.address);

        firstDeposit = ethers.utils.parseEther("150");
        await stable.connect(add1).approve(fund.address, firstDeposit);

        await fund.connect(add1).deposit(firstDeposit);

        //since the first cap is 100 tokens, we expect the projectDeveloper to be able to withdraw only this amount
        await expect(() =>
            fund.connect(projectDeveloper).withdraw()
        ).to.changeTokenBalance(
            stable,
            projectDeveloper,
            ethers.utils.parseEther("100")
        );
    });

    function applyFee(amount) {
        const numerator = 3;
        const denominator = 100;
        return amount.mul(numerator).div(denominator);
    }

    it("Should allow withdrawal of the correct amounts for many caps", async() => {
        // let caps = ["100", "1000", "20000"].map(x => ethers.utils.parseEther(x))
        let caps = amountCaps;
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();
        await fund.approveAddress(add1.address);
        soFar = ethers.utils.parseEther("0");
        for (const cap of caps) {
            amount = cap.sub(soFar);
            await stable.mint(add1.address, amount);
            await stable.connect(add1).approve(fund.address, amount);
            await fund.connect(add1).deposit(amount);
            soFar = soFar.add(cap);
            expect(() =>
                fund.connect(projectDeveloper).withdraw()
            ).to.changeTokenBalance(stable, projectDeveloper, cap);
        }
    });

    it("Should not leave locked tokens after all withdrawals", async() => {
        let caps = ["100", "900", "15000"].map((x) => ethers.utils.parseEther(x));
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();

        await fund.approveAddress(add1.address);
        // let tally = BigNumber.from(0)
        for (const cap of caps) {
            await stable.connect(owner).mint(add1.address, cap);
            await stable.connect(add1).approve(fund.address, cap);
            await fund.connect(add1).deposit(cap);
        }
        let totalLocked = ethers.utils.parseEther("16000");
        totalLocked = totalLocked.sub(applyFee(totalLocked));
        await expect(() =>
            fund.connect(projectDeveloper).withdraw()
        ).to.changeTokenBalance(stable, projectDeveloper, totalLocked);
    });
    it("Should revert if project developer tries to withdraw early", async() => {
        //TODO awaiting confirmation on requirements from Dimitry
    });
    it("Should close the fund if insufficient funds are raised before cap time", async() => {
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();
        let amount = ethers.utils.parseEther("45");
        await fund.approveAddress(add1.address);
        await stable.connect(owner).mint(add1.address, amount);
        await stable.connect(add1).approve(fund.address, amount);
        await fund.connect(add1).deposit(amount);

        await network.provider.send("evm_increaseTime", [week + 10]); //SHould have expired
        await network.provider.send("evm_mine");
        expect(await fund.closed()).to.equal(true);
    });
    it("Should collect correct fees", async() => {
        let { stable, fund, owner, add1, add2, projectDeveloper, feeCollector } =
        await setup();
        let amount = ethers.utils.parseEther("60");
        await fund.approveAddress(add1.address);
        await stable.connect(owner).mint(add1.address, amount);
        await stable.connect(add1).approve(fund.address, amount);

        await expect(() =>
            fund.connect(add1).deposit(amount)
        ).to.changeTokenBalance(
            stable,
            feeCollector,
            ethers.utils.parseEther("1.8")
        );
    });
});