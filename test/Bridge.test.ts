import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bridge } from "../typechain-types";
import { MockERC20 } from "../typechain-types";

describe("Bridge", function () {
  async function deployBridgeFixture() {
    const [owner, user] = await ethers.getSigners();

    // Deploy mock ERC20 token
    const MockToken = await ethers.getContractFactory("MockERC20");
    const mockToken = await MockToken.deploy("Mock Token", "MTK");
    await mockToken.waitForDeployment();

    // Deploy Bridge contract
    const Bridge = await ethers.getContractFactory("Bridge");
    const bridge = await Bridge.deploy();
    await bridge.waitForDeployment();

    // Mint tokens to user
    const amount = ethers.parseEther("1000");
    await mockToken.mint(user.address, amount);

    return { bridge, mockToken, owner, user };
  }

  describe("Token Locking", function () {
    it("Should lock tokens successfully", async function () {
      const { bridge, mockToken, user } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("100");
      const targetChainId = 80001; // Amoy testnet

      // Approve bridge to spend tokens
      await mockToken.connect(user).approve(await bridge.getAddress(), amount);

      // Lock tokens
      await expect(bridge.connect(user).lockTokens(
        await mockToken.getAddress(),
        amount,
        targetChainId
      ))
        .to.emit(bridge, "TokensLocked")
        .withArgs(
          await mockToken.getAddress(),
          user.address,
          amount,
          targetChainId,
          0 // nonce
        );
    });

    it("Should fail if amount is 0", async function () {
      const { bridge, mockToken, user } = await loadFixture(deployBridgeFixture);
      
      await expect(
        bridge.connect(user).lockTokens(
          await mockToken.getAddress(),
          0,
          80001
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });

  describe("Token Unlocking", function () {
    it("Should unlock tokens successfully", async function () {
      const { bridge, mockToken, owner, user } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("100");
      const transactionHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      // First lock some tokens
      await mockToken.connect(user).approve(await bridge.getAddress(), amount);
      await bridge.connect(user).lockTokens(
        await mockToken.getAddress(),
        amount,
        80001
      );

      // Unlock tokens
      await expect(bridge.connect(owner).unlockTokens(
        await mockToken.getAddress(),
        user.address,
        amount,
        transactionHash
      ))
        .to.emit(bridge, "TokensUnlocked")
        .withArgs(
          await mockToken.getAddress(),
          user.address,
          amount,
          transactionHash
        );
    });

    it("Should fail if transaction hash already processed", async function () {
      const { bridge, mockToken, owner, user } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("100");
      const transactionHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      // Process transaction first time
      await bridge.connect(owner).unlockTokens(
        await mockToken.getAddress(),
        user.address,
        amount,
        transactionHash
      );

      // Try to process same transaction again
      await expect(
        bridge.connect(owner).unlockTokens(
          await mockToken.getAddress(),
          user.address,
          amount,
          transactionHash
        )
      ).to.be.revertedWith("Transaction already processed");
    });
  });
});