import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { EntryPoint, TokenBridge, MockERC20, BridgeOracle } from "../typechain-types";

describe("TokenBridge", function () {
  let entryPoint: EntryPoint;
  let tokenBridge: TokenBridge;
  let mockUSDC: MockERC20;
  let bridgeOracle: BridgeOracle;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let oracle: SignerWithAddress;

  beforeEach(async function () {
    [owner, user, oracle] = await ethers.getSigners();

    // Deploy contracts
    const EntryPoint = await ethers.getContractFactory("EntryPoint");
    entryPoint = await EntryPoint.deploy();
    await entryPoint.deployed();

    const TokenBridge = await ethers.getContractFactory("TokenBridge");
    tokenBridge = await TokenBridge.deploy(entryPoint.address);
    await tokenBridge.deployed();

    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC");
    await mockUSDC.deployed();

    const BridgeOracle = await ethers.getContractFactory("BridgeOracle");
    bridgeOracle = await BridgeOracle.deploy(2); // Require 2 confirmations
    await bridgeOracle.deployed();

    // Setup
    await tokenBridge.addSupportedToken(mockUSDC.address);
    await bridgeOracle.addOracle(oracle.address);
    await mockUSDC.mint(user.address, ethers.utils.parseEther("1000"));
    await mockUSDC.connect(user).approve(tokenBridge.address, ethers.constants.MaxUint256);
  });

  describe("Lock and Mint", function () {
    it("Should lock tokens on source chain", async function () {
      const amount = ethers.utils.parseEther("100");
      const tx = await tokenBridge.connect(user).lockTokens(
        mockUSDC.address,
        amount,
        80001 // Amoy testnet chainId
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TokensLocked");
      expect(event).to.not.be.undefined;
      expect(event?.args?.token).to.equal(mockUSDC.address);
      expect(event?.args?.from).to.equal(user.address);
      expect(event?.args?.amount).to.equal(amount);
    });

    it("Should mint tokens after oracle confirmation", async function () {
      const amount = ethers.utils.parseEther("100");
      const tx = await tokenBridge.connect(user).lockTokens(
        mockUSDC.address,
        amount,
        80001
      );
      
      const receipt = await tx.wait();
      const operationId = receipt.events?.find(e => e.event === "TokensLocked")?.args?.operationId;

      // Oracle confirmations
      await bridgeOracle.connect(owner).confirmOperation(operationId);
      await bridgeOracle.connect(oracle).confirmOperation(operationId);

      const mintTx = await tokenBridge.mintTokens(
        mockUSDC.address,
        user.address,
        amount,
        operationId
      );
      
      const mintReceipt = await mintTx.wait();
      const mintEvent = mintReceipt.events?.find(e => e.event === "TokensMinted");
      expect(mintEvent).to.not.be.undefined;
      expect(mintEvent?.args?.token).to.equal(mockUSDC.address);
      expect(mintEvent?.args?.to).to.equal(user.address);
      expect(mintEvent?.args?.amount).to.equal(amount);
    });
  });

  describe("Burn and Unlock", function () {
    it("Should burn tokens on destination chain", async function () {
      const amount = ethers.utils.parseEther("100");
      const tx = await tokenBridge.connect(user).burnTokens(
        mockUSDC.address,
        amount
      );
      
      const receipt = await tx.wait();
      const event = receipt.events?.find(e => e.event === "TokensBurned");
      expect(event).to.not.be.undefined;
      expect(event?.args?.token).to.equal(mockUSDC.address);
      expect(event?.args?.from).to.equal(user.address);
      expect(event?.args?.amount).to.equal(amount);
    });

    it("Should unlock tokens after oracle confirmation", async function () {
      const amount = ethers.utils.parseEther("100");
      const burnTx = await tokenBridge.connect(user).burnTokens(
        mockUSDC.address,
        amount
      );
      
      const burnReceipt = await burnTx.wait();
      const operationId = burnReceipt.events?.find(e => e.event === "TokensBurned")?.args?.operationId;

      // Oracle confirmations
      await bridgeOracle.connect(owner).confirmOperation(operationId);
      await bridgeOracle.connect(oracle).confirmOperation(operationId);

      const unlockTx = await tokenBridge.unlockTokens(
        mockUSDC.address,
        user.address,
        amount,
        operationId
      );
      
      const unlockReceipt = await unlockTx.wait();
      const unlockEvent = unlockReceipt.events?.find(e => e.event === "TokensUnlocked");
      expect(unlockEvent).to.not.be.undefined;
      expect(unlockEvent?.args?.token).to.equal(mockUSDC.address);
      expect(unlockEvent?.args?.to).to.equal(user.address);
      expect(unlockEvent?.args?.amount).to.equal(amount);
    });
  });
});