import { ethers, network } from "hardhat"
import * as fs from 'fs';

const parsedToken = JSON.parse(fs.readFileSync("./artifacts/contracts/Token.sol/Token.json"));
const parsedDelegates = JSON.parse(fs.readFileSync("./artifacts/contracts/Delegates.sol/Delegates.json"));

const { INFURA_KEY, PK } = process.env;

// Config
const config = {
	numberOfDelegators: 10,
	CHAIN_ID: 5,
	INFURA_KEY: INFURA_KEY,
	context: "gnosis.eth"
}

const provider = new ethers.providers.InfuraProvider(config.CHAIN_ID, config.INFURA_KEY)

const delegateAddress = "0x69Fa3f86732Bd96728dc247d8DE8D8c4EA3Cb726"
const gnoAddress= ""

const signer = new ethers.Wallet(PK, provider);

const delegates = new ethers.Contract(delegateAddress, parsedDelegates.abi, signer);
//const token = new ethers.Contract(gnoAddress, parsedToken.abi, signer);

for (let i = 0; i < config.numberOfDelegators; i++) {
	const randomAddressDelegator = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()
	const randomAddressDelegatee = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()

	console.log(randomAddressDelegator)
	try {
		const walletDelegator = new ethers.Wallet(randomAddressDelegator);
		console.log("Address Delegator: " + walletDelegator.address);
	} catch (e) {
		console.log(e)
	}

	try {
		const walletDelegatee = new ethers.Wallet(randomAddressDelegatee);
		console.log("Address Delegatee: " + walletDelegatee.address);
	} catch (e) {
		console.log(e)
	}

	//const gnoBalance = await token.balanceOf(randomAddress)
	const Delegation = {
		delegate: randomAddressDelegatee,
		ratio: 20
	}
	//const delegate = await delegates.setDelegation(config.context, , 18446744073709551615)

}
