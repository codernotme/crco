import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy GaslessForwarder
  const GaslessForwarder = await ethers.getContractFactory("GaslessForwarder");
  const gaslessForwarder = await GaslessForwarder.deploy();
  await gaslessForwarder.deployed();
  console.log("GaslessForwarder deployed to:", gaslessForwarder.address);

  // Deploy LockAndMintV2
  const LockAndMintV2 = await ethers.getContractFactory("LockAndMintV2");
  const lockAndMintV2 = await LockAndMintV2.deploy();
  await lockAndMintV2.deployed();
  console.log("LockAndMintV2 deployed to:", lockAndMintV2.address);

  // Deploy UnlockAndBurnV2
  const UnlockAndBurnV2 = await ethers.getContractFactory("UnlockAndBurnV2");
  const unlockAndBurnV2 = await UnlockAndBurnV2.deploy();
  await unlockAndBurnV2.deployed();
  console.log("UnlockAndBurnV2 deployed to:", unlockAndBurnV2.address);

  // Deploy test tokens
  const MockToken = await ethers.getContractFactory("MockERC20");
  
  const usdcToken = await MockToken.deploy("USD Coin", "USDC");
  await usdcToken.deployed();
  console.log("USDC Token deployed to:", usdcToken.address);
  
  const usdtToken = await MockToken.deploy("Tether USD", "USDT");
  await usdtToken.deployed();
  console.log("USDT Token deployed to:", usdtToken.address);

  // Setup contracts
  await lockAndMintV2.addTrustedForwarder(gaslessForwarder.address);
  await unlockAndBurnV2.addTrustedForwarder(gaslessForwarder.address);

  // Add supported assets
  await lockAndMintV2.addSupportedAsset(usdcToken.address, usdcToken.address, 0); // ERC20
  await lockAndMintV2.addSupportedAsset(usdtToken.address, usdtToken.address, 0); // ERC20

  await unlockAndBurnV2.addSupportedWrappedAsset(usdcToken.address, usdcToken.address, 0);
  await unlockAndBurnV2.addSupportedWrappedAsset(usdtToken.address, usdtToken.address, 0);

  console.log("\nDeployment complete! Contract addresses:");
  console.log("----------------------------------------");
  console.log("GaslessForwarder:", gaslessForwarder.address);
  console.log("LockAndMintV2:", lockAndMintV2.address);
  console.log("UnlockAndBurnV2:", unlockAndBurnV2.address);
  console.log("USDC Token:", usdcToken.address);
  console.log("USDT Token:", usdtToken.address);

  // Update .env file
  const fs = require('fs');
  const envFile = '.env';
  const envVars = {
    VITE_GASLESS_FORWARDER_ADDRESS: gaslessForwarder.address,
    VITE_LOCK_AND_MINT_ADDRESS: lockAndMintV2.address,
    VITE_UNLOCK_AND_BURN_ADDRESS: unlockAndBurnV2.address,
    VITE_USDC_ADDRESS: usdcToken.address,
    VITE_USDT_ADDRESS: usdtToken.address,
  };

  let envContent = fs.readFileSync(envFile, 'utf8');
  for (const [key, value] of Object.entries(envVars)) {
    const regex = new RegExp(`${key}=.*`);
    if (envContent.match(regex)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  }
  fs.writeFileSync(envFile, envContent);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });