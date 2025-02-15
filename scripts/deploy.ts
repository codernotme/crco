import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TokenFactory
  const TokenFactory = await ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.waitForDeployment();
  console.log("TokenFactory deployed to:", await tokenFactory.getAddress());

  // Deploy BridgeV2
  const BridgeV2 = await ethers.getContractFactory("BridgeV2");
  const bridgeV2 = await BridgeV2.deploy();
  await bridgeV2.waitForDeployment();
  console.log("BridgeV2 deployed to:", await bridgeV2.getAddress());

  // Deploy LockAndMint
  const LockAndMint = await ethers.getContractFactory("LockAndMint");
  const lockAndMint = await LockAndMint.deploy();
  await lockAndMint.waitForDeployment();
  console.log("LockAndMint deployed to:", await lockAndMint.getAddress());

  // Deploy UnlockAndBurn
  const UnlockAndBurn = await ethers.getContractFactory("UnlockAndBurn");
  const unlockAndBurn = await UnlockAndBurn.deploy();
  await unlockAndBurn.waitForDeployment();
  console.log("UnlockAndBurn deployed to:", await unlockAndBurn.getAddress());

  // Create test tokens
  const createTokenTx = await tokenFactory.createToken(
    "Test USDC",
    "USDC",
    ethers.parseEther("1000000")
  );
  await createTokenTx.wait();

  const createTokenTx2 = await tokenFactory.createToken(
    "Test USDT",
    "USDT",
    ethers.parseEther("1000000")
  );
  await createTokenTx2.wait();

  // Verify contract addresses
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("TokenFactory:", await tokenFactory.getAddress());
  console.log("BridgeV2:", await bridgeV2.getAddress());
  console.log("LockAndMint:", await lockAndMint.getAddress());
  console.log("UnlockAndBurn:", await unlockAndBurn.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });