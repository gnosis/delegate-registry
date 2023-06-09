import { ethers, network } from "hardhat"
//import dotenv from "dotenv";

const { INFURA_KEY } = process.env;

// Config
const config = {
	numberOfDelegators: 10,
	CHAIN_ID: 5,
	INFURA_KEY: INFURA_KEY
}

const provider = new ethers.providers.InfuraProvider(config.CHAIN_ID, config.INFURA_KEY)

const delegateAddress = "0x69Fa3f86732Bd96728dc247d8DE8D8c4EA3Cb726"
const gnoAddress= ""

for (let i = 0; i < config.numberOfDelegators; i++) {
	const test = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()

	console.log(test)
	const wallet = new ethers.Wallet(test);
	console.log("Address: " + wallet.address);
}