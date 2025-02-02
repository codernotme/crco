const hre = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy CrCoToken
  const CrCoToken = await ethers.getContractFactory("CrCoToken");
  const token = await CrCoToken.deploy();
  await token.deployed();
  console.log("CrCoToken deployed to:", token.address);

  // Get network chainId
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId;

  // Deploy CrCoBridge
  const CrCoBridge = await ethers.getContractFactory("CrCoBridge");
  const bridge = await CrCoBridge.deploy(token.address, chainId);
  await bridge.deployed();
  console.log("CrCoBridge deployed to:", bridge.address);

  // Grant roles
  const minterRole = await token.MINTER_ROLE();
  const burnerRole = await token.BURNER_ROLE();
  await token.grantRole(minterRole, bridge.address);
  await token.grantRole(burnerRole, bridge.address);
  console.log("Roles granted to bridge contract");

  // Save addresses to environment variables
  console.log(`NEXT_PUBLIC_${network.name.toUpperCase()}_TOKEN_ADDRESS=${token.address}`);
  console.log(`NEXT_PUBLIC_${network.name.toUpperCase()}_BRIDGE_ADDRESS=${bridge.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });