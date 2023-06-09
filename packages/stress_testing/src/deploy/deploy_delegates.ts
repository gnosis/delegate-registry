import { formatBytes32String } from "ethers/lib/utils";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const deploy: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deployer } = await getNamedAccounts();
  const { deploy } = deployments;
  console.log(deployer)

  const args = [];

  await deploy("Delegates", {
    from: deployer,
    args,
    log: true,
    deterministicDeployment: true,
    nonce: 127,
    gasPrice: 50000000000
  });
};

deploy.tags = ["Delegates"];
export default deploy;
