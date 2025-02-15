import { ethers, run } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy CrCoToken
  const CrCoToken = await ethers.getContractFactory("CrCoToken");
  const token = await CrCoToken.deploy();
  await token.deployed();
  console.log("CrCoToken deployed to:", token.address);

  // Deploy CrCoNFT
  const CrCoNFT = await ethers.getContractFactory("CrCoNFT");
  const nft = await CrCoNFT.deploy();
  await nft.deployed();
  console.log("CrCoNFT deployed to:", nft.address);

  // Deploy CrCoBridge
  const CrCoBridge = await ethers.getContractFactory("CrCoBridge");
  const bridge = await CrCoBridge.deploy();
  await bridge.deployed();
  console.log("CrCoBridge deployed to:", bridge.address);

  // Setup roles
  const BRIDGE_ROLE = await bridge.BRIDGE_ROLE();
  const OPERATOR_ROLE = await bridge.OPERATOR_ROLE();
  const MINTER_ROLE = await token.MINTER_ROLE();
  const BURNER_ROLE = await token.BURNER_ROLE();

  // Grant roles to bridge
  await token.grantRole(MINTER_ROLE, bridge.address);
  await token.grantRole(BURNER_ROLE, bridge.address);
  await nft.grantRole(MINTER_ROLE, bridge.address);
  await nft.grantRole(BURNER_ROLE, bridge.address);
  
  console.log("Roles configured successfully");

  // Verify contracts on block explorer
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contracts...");
    await run("verify:verify", {
      address: token.address,
      constructorArguments: [],
    });
    await run("verify:verify", {
      address: nft.address,
      constructorArguments: [],
    });
    await run("verify:verify", {
      address: bridge.address,
      constructorArguments: [],
    });
    console.log("Contracts verified successfully");
  }

  return { token, nft, bridge };
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });