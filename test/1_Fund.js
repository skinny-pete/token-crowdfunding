const {
  expect
} = require("chai");
const { providers } = require("ethers");
const {
  ethers
} = require("hardhat");

async function setup() {

  const [owner, add1, add2, projectDeveloper] = await ethers.getSigners();

  const caps = ["100", "1000", "20000"].map(x => ethers.utils.parseEther(x))

  const _stable = await ethers.getContractFactory("TestToken");
  const stable = await _stable.deploy(owner.address, ethers.utils.parseEther("100000"));
  const _fund = await ethers.getContractFactory("Fund");
  const fund = await _fund.deploy(projectDeveloper.address, stable.address, caps)

  return {
    stable,
    fund,
    owner,
    add1,
    add2,
    projectDeveloper
  }



}

describe("Fund", function () {
  it("Should deploy without errors", async () => {
    await setup();
  })
  it("Should allow a stranger to deposit stable, recieving fund tokens in return", async () => {
    let {
      stable,
      fund,
      owner,
      add1,
      add2,
      projectDeveloper
    } = await setup()

    await stable.connect(owner).mint(add1.address, ethers.utils.parseEther("100"))
    await fund.approveAddress(add1.address)

    firstDeposit = ethers.utils.parseEther("10")
    await stable.connect(add1).approve(fund.address, firstDeposit);

    await expect(() => fund.connect(add1).deposit(firstDeposit))
      .to.changeTokenBalance(fund, add1, ethers.utils.parseEther("1"))

    secondDeposit = ethers.utils.parseEther("55")
    await stable.connect(add1).approve(fund.address, secondDeposit);
    await expect(() => fund.connect(add1).deposit(secondDeposit))
      .to.changeTokenBalance(fund, add1, ethers.utils.parseEther("5.5"))
  })
  it("Should not allow the project developer to withdraw funds before the first cap is reached", async () => {
    let {
      stable,
      fund,
      owner,
      add1,
      add2,
      projectDeveloper
    } = await setup()

    await stable.connect(owner).mint(add1.address, ethers.utils.parseEther("100"))
    await fund.approveAddress(add1.address)

    firstDeposit = ethers.utils.parseEther("10")
    await stable.connect(add1).approve(fund.address, firstDeposit);

    await expect(fund.connect(projectDeveloper).withdraw())
      .to.be.revertedWith("Cannot withdraw until secondary cap reached")
  })
  it("Should allow the project developer to withdraw funds after first cap has been reached", async () => {
    let {
      stable,
      fund,
      owner,
      add1,
      add2,
      projectDeveloper
    } = await setup()

    await stable.connect(owner).mint(add1.address, ethers.utils.parseEther("150"))
    await fund.approveAddress(add1.address)

    firstDeposit = ethers.utils.parseEther("150")
    await stable.connect(add1).approve(fund.address, firstDeposit);

    await fund.connect(add1).deposit(firstDeposit)


    //since the first cap is 100 tokens, we expect the projectDeveloper to be able to withdraw only this amount
    await expect(() => fund.connect(projectDeveloper).withdraw())
      .to.changeTokenBalance(stable, projectDeveloper, ethers.utils.parseEther("100"))

  })

  it("Should allow withdrawal of the correct amounts for many caps", async () => {
    let caps = ["100", "900", "19000"].map(x => ethers.utils.parseEther(x))
    let {
      stable,
      fund,
      owner,
      add1,
      add2,
      projectDeveloper
    } = await setup()
    await fund.approveAddress(add1.address)
    let pcap;
    for (const cap of caps) {
      await stable.connect(owner).mint(add1.address, cap)
      await stable.connect(add1).approve(fund.address, cap)
      await fund.connect(add1).deposit(cap)
      pcap = cap

      await expect(() => fund.connect(projectDeveloper).withdraw())
        .to.changeTokenBalance(stable, projectDeveloper, pcap)
    }
  })

  it("Should not leave locked tokens after all withdrawals", async () => {
    let caps = ["100", "900", "19000"].map(x => ethers.utils.parseEther(x))
    let {
      stable,
      fund,
      owner,
      add1,
      add2,
      projectDeveloper
    } = await setup()

    await fund.approveAddress(add1.address)
    // let tally = BigNumber.from(0)
    for (const cap of caps) {
      await stable.connect(owner).mint(add1.address, cap)
      await stable.connect(add1).approve(fund.address, cap)
      await fund.connect(add1).deposit(cap)

    }
    let totalLocked = ethers.utils.parseEther("20000");
    await expect(() => fund.connect(projectDeveloper).withdraw())
      .to.changeTokenBalance(stable, projectDeveloper, totalLocked)
  })

});