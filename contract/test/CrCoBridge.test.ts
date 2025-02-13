import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { CrCoBridge, CrCoToken, CrCoNFT } from "../typechain-types";

describe("CrCoBridge", function () {
  let bridge: CrCoBridge;
  let token: CrCoToken;
  let nft: CrCoNFT;
  let owner: SignerWithAddress;
  let user: SignerWithAddress;
  let operator: SignerWithAddress;

  const AssetType = {
    ERC20: 0,
    ERC721: 1
  };

  const ChainType = {
    AMOY_TESTNET: 0,
    SEPOLIA_TESTNET: 1
  };

  beforeEach(async function () {
    [owner, user, operator] = await ethers.getSigners();

    // Deploy contracts
    const Token = await ethers.getContractFactory("CrCoToken");
    token = await Token.deploy();

    const NFT = await ethers.getContractFactory("CrCoNFT");
    nft = await NFT.deploy();

    const Bridge = await ethers.getContractFactory("CrCoBridge");
    bridge = await Bridge.deploy();

    // Setup roles
    const OPERATOR_ROLE = await bridge.OPERATOR_ROLE();
    await bridge.grantRole(OPERATOR_ROLE, operator.address);

    // Mint tokens to user
    await token.mint(user.address, ethers.utils.parseEther("1000"));
    await token.connect(user).approve(bridge.address, ethers.constants.MaxUint256);

    // Mint NFT to user
    await nft.mint(user.address, 1, "test-uri");
    await nft.connect(user).approve(bridge.address, 1);
  });

  describe("Lock and Mint", function () {
    it("Should lock ERC20 tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      const bridgeFee = ethers.utils.parseEther("0.001");

      await expect(
        bridge.connect(user).lockAndMint(
          AssetType.ERC20,
          token.address,
          amount,
          user.address,
          ChainType.AMOY_TESTNET,
          ChainType.SEPOLIA_TESTNET,
          { value: bridgeFee }
        )
      ).to.emit(bridge, "AssetLocked");

      expect(await token.balanceOf(bridge.address)).to.equal(amount);
    });

    it("Should lock NFT", async function () {
      const tokenId = 1;
      const bridgeFee = ethers.utils.parseEther("0.001");

      await expect(
        bridge.connect(user).lockAndMint(
          AssetType.ERC721,
          nft.address,
          tokenId,
          user.address,
          ChainType.AMOY_TESTNET,
          ChainType.SEPOLIA_TESTNET,
          { value: bridgeFee }
        )
      ).to.emit(bridge, "AssetLocked");

      expect(await nft.ownerOf(tokenId)).to.equal(bridge.address);
    });
  });

  describe("Unlock and Burn", function () {
    it("Should unlock ERC20 tokens", async function () {
      const amount = ethers.utils.parseEther("100");
      const transferId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const merkleProof = [transferId]; // Simplified for testing

      // First lock tokens
      await bridge.connect(user).lockAndMint(
        AssetType.ERC20,
        token.address,
        amount,
        user.address,
        ChainType.AMOY_TESTNET,
        ChainType.SEPOLIA_TESTNET,
        { value: ethers.utils.parseEther("0.001") }
      );

      await expect(
        bridge.connect(user).unlockAndBurn(
          AssetType.ERC20,
          token.address,
          amount,
          transferId,
          merkleProof
        )
      ).to.emit(bridge, "AssetUnlocked");
    });

    it("Should unlock NFT", async function () {
      const tokenId = 1;
      const transferId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const merkleProof = [transferId]; // Simplified for testing

      // First lock NFT
      await bridge.connect(user).lockAndMint(
        AssetType.ERC721,
        nft.address,
        tokenId,
        user.address,
        ChainType.AMOY_TESTNET,
        ChainType.SEPOLIA_TESTNET,
        { value: ethers.utils.parseEther("0.001") }
      );

      await expect(
        bridge.connect(user).unlockAndBurn(
          AssetType.ERC721,
          nft.address,
          tokenId,
          transferId,
          merkleProof
        )
      ).to.emit(bridge, "AssetUnlocked");
    });
  });

  describe("Cross-Chain Transfer", function () {
    it("Should initiate cross-chain ERC20 transfer", async function () {
      const amount = ethers.utils.parseEther("100");
      const bridgeFee = ethers.utils.parseEther("0.001");

      await expect(
        bridge.connect(user).initiateCrossChainTransfer(
          AssetType.ERC20,
          token.address,
          ChainType.AMOY_TESTNET,
          ChainType.SEPOLIA_TESTNET,
          amount,
          user.address,
          { value: bridgeFee }
        )
      ).to.emit(bridge, "CrossChainTransferInitiated");
    });

    it("Should complete cross-chain ERC20 transfer", async function () {
      const amount = ethers.utils.parseEther("100");
      const transferId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const merkleProof = [transferId]; // Simplified for testing

      await expect(
        bridge.connect(operator).completeCrossChainTransfer(
          AssetType.ERC20,
          token.address,
          amount,
          user.address,
          transferId,
          merkleProof
        )
      ).to.emit(bridge, "CrossChainTransferCompleted");
    });
  });

  describe("Security", function () {
    it("Should prevent unauthorized operators", async function () {
      const amount = ethers.utils.parseEther("100");
      const transferId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const merkleProof = [transferId];

      await expect(
        bridge.connect(user).completeCrossChainTransfer(
          AssetType.ERC20,
          token.address,
          amount,
          user.address,
          transferId,
          merkleProof
        )
      ).to.be.revertedWith("AccessControl");
    });

    it("Should prevent double-spending", async function () {
      const amount = ethers.utils.parseEther("100");
      const transferId = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("test"));
      const merkleProof = [transferId];

      await bridge.connect(operator).completeCrossChainTransfer(
        AssetType.ERC20,
        token.address,
        amount,
        user.address,
        transferId,
        merkleProof
      );

      await expect(
        bridge.connect(operator).completeCrossChainTransfer(
          AssetType.ERC20,
          token.address,
          amount,
          user.address,
          transferId,
          merkleProof
        )
      ).to.be.revertedWith("Transfer already processed");
    });
  });
});