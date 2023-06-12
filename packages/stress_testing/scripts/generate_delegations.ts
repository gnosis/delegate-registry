import { ethers } from "hardhat";

async function main() {
  const DelegationEventGenerator = await ethers.getContractFactory(
    "DelegationEventGenerator"
  );
  const delegationEventGenerator = await DelegationEventGenerator.deploy(
    "myplay.eth",
    100,
    2086558524000
  );

  await delegationEventGenerator.deployed();

  console.log(
    `DelegationEventGenerator deployed to ${delegationEventGenerator.address}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
