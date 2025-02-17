import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy EntryPoint
  const EntryPoint = await ethers.getContractFactory("EntryPoint");
  const entryPoint = await EntryPoint.deploy();
  await entryPoint.deployed();
  console.log("EntryPoint deployed to:", entryPoint.address);

  // Deploy CrossChainBridge
  const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
  const crossChainBridge = await CrossChainBridge.deploy(entryPoint.address);
  await crossChainBridge.deployed();
  console.log("CrossChainBridge deployed to:", crossChainBridge.address);

  // Deploy BridgeValidator
  const BridgeValidator = await ethers.getContractFactory("BridgeValidator");
  const bridgeValidator = await BridgeValidator.deploy(2, 3600); // 2 validations required, 1 hour timeout
  await bridgeValidator.deployed();
  console.log("BridgeValidator deployed to:", bridgeValidator.address);

  // Deploy test tokens
  const MockToken = await ethers.getContractFactory("MockERC20");
  
  const usdcToken = await MockToken.deploy("USD Coin", "USDC");
  await usdcToken.deployed();
  console.log("USDC Token deployed to:", usdcToken.address);
  
  const usdtToken = await MockToken.deploy("Tether USD", "USDT");
  await usdtToken.deployed();
  console.log("USDT Token deployed to:", usdtToken.address);

  // Setup supported tokens and chains
  await crossChainBridge.addSupportedToken(usdcToken.address);
  await crossChainBridge.addSupportedToken(usdtToken.address);
  await crossChainBridge.addSupportedChain(11155111); // Sepolia
  await crossChainBridge.addSupportedChain(80001); // Amoy

  console.log("\nDeployment complete! Contract addresses:");
  console.log("----------------------------------------");
  console.log("EntryPoint:", entryPoint.address);
  console.log("CrossChainBridge:", crossChainBridge.address);
  console.log("BridgeValidator:", bridgeValidator.address);
  console.log("USDC Token:", usdcToken.address);
  console.log("USDT Token:", usdtToken.address);

  // Update .env file
  const fs = require('fs');
  const envFile = '.env';
  const envVars = {
    VITE_SEPOLIA_BRIDGE_ADDRESS: crossChainBridge.address,
    VITE_AMOY_BRIDGE_ADDRESS: crossChainBridge.address,
    VITE_USDC_ADDRESS_SEPOLIA: usdcToken.address,
    VITE_USDT_ADDRESS_SEPOLIA: usdtToken.address,
  };

  let envContent = fs.readFileSync(envFile, 'utf8');
  for (const [key, value] of Object.entries(envVars)) {
    const regex = new RegExp(`${key}=.*`);
    envContent = envContent.replace(regex, `${key}=${value}`);
  }
  fs.writeFileSync(envFile, envContent);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });