const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error("No deployer account found");
  }
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy TokenFactory
  const TokenFactory = await hre.ethers.getContractFactory("TokenFactory");
  const tokenFactory = await TokenFactory.deploy();
  await tokenFactory.deployed();
  console.log("TokenFactory deployed to:", tokenFactory.address);

  // Deploy BridgeV2
  const BridgeV2 = await hre.ethers.getContractFactory("BridgeV2");
  const bridgeV2 = await BridgeV2.deploy();
  await bridgeV2.deployed();
  console.log("BridgeV2 deployed to:", bridgeV2.address);

  // Deploy LockAndMint
  const LockAndMint = await hre.ethers.getContractFactory("LockAndMint");
  const lockAndMint = await LockAndMint.deploy();
  await lockAndMint.deployed();
  console.log("LockAndMint deployed to:", lockAndMint.address);

  // Deploy UnlockAndBurn
  const UnlockAndBurn = await hre.ethers.getContractFactory("UnlockAndBurn");
  const unlockAndBurn = await UnlockAndBurn.deploy();
  await unlockAndBurn.deployed();
  console.log("UnlockAndBurn deployed to:", unlockAndBurn.address);

  // Create test tokens
  const createTokenTx = await tokenFactory.createToken(
    "Test USDC",
    "USDC",
    hre.ethers.utils.parseEther("1000000")
  );
  await createTokenTx.wait();

  const createTokenTx2 = await tokenFactory.createToken(
    "Test USDT",
    "USDT",
    hre.ethers.utils.parseEther("1000000")
  );
  await createTokenTx2.wait();

  // Verify contract addresses
  console.log("\nContract Addresses:");
  console.log("-------------------");
  console.log("TokenFactory:", tokenFactory.address);
  console.log("BridgeV2:", bridgeV2.address);
  console.log("LockAndMint:", lockAndMint.address);
  console.log("UnlockAndBurn:", unlockAndBurn.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
