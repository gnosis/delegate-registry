import { ethers } from "hardhat";

async function main() {
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);

  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  await token.deployed();

  console.log(`Deployed token to ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
