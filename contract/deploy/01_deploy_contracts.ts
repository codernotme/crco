import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import fs from "fs";
import path from "path";
// import { ethers } from "ethers";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log(`Deploying to ${network.name} with deployer ${deployer}`);

  // Deploy CrCoToken
  const token = await deploy("CrCoToken", {
    from: deployer,
    args: [],
    log: true,
  });

  // Deploy CrCoNFT
  const nft = await deploy("CrCoNFT", {
    from: deployer,
    args: [],
    log: true,
  });

  // Deploy CrCoBridge
  const bridge = await deploy("CrCoBridge", {
    from: deployer,
    args: [],
    log: true,
  });

  // Setup roles
  const CrCoToken = await hre.ethers.getContractAt("CrCoToken", token.address);
  const CrCoNFT = await hre.ethers.getContractAt("CrCoNFT", nft.address);
  const CrCoBridge = await hre.ethers.getContractAt("CrCoBridge", bridge.address);

  const MINTER_ROLE = await CrCoToken.MINTER_ROLE();
  const BURNER_ROLE = await CrCoToken.BURNER_ROLE();

  // Grant roles to bridge
  await CrCoToken.grantRole(MINTER_ROLE, bridge.address);
  await CrCoToken.grantRole(BURNER_ROLE, bridge.address);
  await CrCoNFT.grantRole(MINTER_ROLE, bridge.address);
  await CrCoNFT.grantRole(BURNER_ROLE, bridge.address);

  // Update frontend environment variables
  const envPath = path.join(__dirname, "../../frontend/.env");
  const envVars = {
    [`NEXT_PUBLIC_${network.name.toUpperCase()}_TOKEN_ADDRESS`]: token.address,
    [`NEXT_PUBLIC_${network.name.toUpperCase()}_NFT_ADDRESS`]: nft.address,
    [`NEXT_PUBLIC_${network.name.toUpperCase()}_BRIDGE_ADDRESS`]: bridge.address,
  };

  let envContent = "";
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, "utf8");
  }

  Object.entries(envVars).forEach(([key, value]) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(envContent)) {
      envContent = envContent.replace(regex, `${key}=${value}`);
    } else {
      envContent += `\n${key}=${value}`;
    }
  });

  fs.writeFileSync(envPath, envContent);

  console.log("Deployment completed!");
  console.log("Token:", token.address);
  console.log("NFT:", nft.address);
  console.log("Bridge:", bridge.address);
};

export default func;
func.tags = ["CrCo"];