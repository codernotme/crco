import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract } from "ethers";

describe("Custom Contract Implementations", function() {
  let owner: any;
  let addr1: any;
  let addr2: any;
  let token: Contract;

  beforeEach(async function() {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const ERC20 = await ethers.getContractFactory("ERC20");
    token = await ERC20.deploy("Test Token", "TEST");
    await token.deployed();
  });

  describe("ERC20", function() {
    it("Should set the correct name and symbol", async function() {
      expect(await token.name()).to.equal("Test Token");
      expect(await token.symbol()).to.equal("TEST");
    });

    it("Should mint tokens correctly", async function() {
      const amount = ethers.utils.parseEther("100");
      await token._mint(addr1.address, amount);
      expect(await token.balanceOf(addr1.address)).to.equal(amount);
    });

    it("Should handle transfers correctly", async function() {
      const amount = ethers.utils.parseEther("100");
      await token._mint(addr1.address, amount);
      await token.connect(addr1).transfer(addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
      expect(await token.balanceOf(addr1.address)).to.equal(0);
    });

    it("Should handle allowances correctly", async function() {
      const amount = ethers.utils.parseEther("100");
      await token._mint(addr1.address, amount);
      await token.connect(addr1).approve(addr2.address, amount);
      await token.connect(addr2).transferFrom(addr1.address, addr2.address, amount);
      expect(await token.balanceOf(addr2.address)).to.equal(amount);
    });
  });

  describe("Ownable", function() {
    it("Should set the correct owner", async function() {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should allow ownership transfer", async function() {
      await token.transferOwnership(addr1.address);
      expect(await token.owner()).to.equal(addr1.address);
    });

    it("Should prevent non-owners from transferring ownership", async function() {
      await expect(
        token.connect(addr1).transferOwnership(addr2.address)
      ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
    });
  });

  describe("Pausable", function() {
    let pausableContract: Contract;

    beforeEach(async function() {
      const Pausable = await ethers.getContractFactory("Pausable");
      pausableContract = await Pausable.deploy();
      await pausableContract.deployed();
    });

    it("Should start in unpaused state", async function() {
      expect(await pausableContract.paused()).to.be.false;
    });

    it("Should allow pausing and unpausing", async function() {
      await pausableContract._pause();
      expect(await pausableContract.paused()).to.be.true;

      await pausableContract._unpause();
      expect(await pausableContract.paused()).to.be.false;
    });
  });
});