import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { Bridge } from "../typechain-types";
import { MockERC20 } from "../typechain-types";

describe("Bridge", function () {
  async function deployBridgeFixture() {
    const [owner, user, relayer] = await ethers.getSigners();

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

    return { bridge, mockToken, owner, user, relayer };
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

      // Verify token balance
      expect(await mockToken.balanceOf(await bridge.getAddress())).to.equal(amount);
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

    it("Should fail if transfer fails", async function () {
      const { bridge, mockToken, user } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("1001"); // More than user has
      
      await mockToken.connect(user).approve(await bridge.getAddress(), amount);
      
      await expect(
        bridge.connect(user).lockTokens(
          await mockToken.getAddress(),
          amount,
          80001
        )
      ).to.be.revertedWith("Transfer failed");
    });

    it("Should increment nonce for user", async function () {
      const { bridge, mockToken, user } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("100");
      
      await mockToken.connect(user).approve(await bridge.getAddress(), amount.mul(2));
      
      // First transaction
      await bridge.connect(user).lockTokens(
        await mockToken.getAddress(),
        amount,
        80001
      );
      
      // Second transaction
      await bridge.connect(user).lockTokens(
        await mockToken.getAddress(),
        amount,
        80001
      );
      
      expect(await bridge.nonces(user.address)).to.equal(2);
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

      // Verify token balance
      expect(await mockToken.balanceOf(user.address)).to.equal(ethers.parseEther("1000"));
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

    it("Should fail if called by non-owner", async function () {
      const { bridge, mockToken, user, relayer } = await loadFixture(deployBridgeFixture);
      const amount = ethers.parseEther("100");
      const transactionHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        bridge.connect(relayer).unlockTokens(
          await mockToken.getAddress(),
          user.address,
          amount,
          transactionHash
        )
      ).to.be.revertedWithCustomError(bridge, "OwnableUnauthorizedAccount");
    });

    it("Should fail if amount is 0", async function () {
      const { bridge, mockToken, owner, user } = await loadFixture(deployBridgeFixture);
      const transactionHash = ethers.keccak256(ethers.toUtf8Bytes("test"));

      await expect(
        bridge.connect(owner).unlockTokens(
          await mockToken.getAddress(),
          user.address,
          0,
          transactionHash
        )
      ).to.be.revertedWith("Amount must be greater than 0");
    });
  });
});