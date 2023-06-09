import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy();

  await token.deployed();

  console.log(`Deployed token to ${token.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
