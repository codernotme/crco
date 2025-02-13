import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

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
  const BRIDGE_ROLE = await CrCoBridge.BRIDGE_ROLE();

  // Grant roles to bridge
  await CrCoToken.grantRole(MINTER_ROLE, bridge.address);
  await CrCoToken.grantRole(BURNER_ROLE, bridge.address);
  await CrCoNFT.grantRole(MINTER_ROLE, bridge.address);
  await CrCoNFT.grantRole(BURNER_ROLE, bridge.address);

  console.log("Deployment completed!");
  console.log("Token:", token.address);
  console.log("NFT:", nft.address);
  console.log("Bridge:", bridge.address);
};

export default func;
func.tags = ["CrCo"];