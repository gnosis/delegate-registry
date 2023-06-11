import { ethers, network } from "hardhat"
import * as fs from 'fs';

const parsedToken = JSON.parse(fs.readFileSync("./artifacts/contracts/Token.sol/Token.json"));
const parsedDelegates = JSON.parse(fs.readFileSync("./artifacts/contracts/Delegates.sol/Delegates.json"));

const { INFURA_KEY, PK } = process.env;

// Config
const config = {
	numberOfDelegators: 1,
	CHAIN_ID: 5,
	INFURA_KEY: INFURA_KEY,
	context: "gnosis.eth"
}

const provider = new ethers.providers.InfuraProvider(config.CHAIN_ID, config.INFURA_KEY)

const delegateAddress = "0x69Fa3f86732Bd96728dc247d8DE8D8c4EA3Cb726"
const gnoAddress= "0xE666Ad68a6e2897CD06A9ff378ED8b0d71093398"

let delegateAddresses = []

for (let i = 0; i < config.numberOfDelegators; i++) {
	let addresses = {}
	try {
	  const randomAddressDelegator = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()
	  console.log(randomAddressDelegator)
		const walletDelegator = new ethers.Wallet(randomAddressDelegator);
		addresses.delegatlorPK = randomAddressDelegator
		addresses.delegatorAddress = walletDelegator.address;
		console.log("Address Delegator: " + walletDelegator.address);
	} catch (e) {
		console.log(e)
	}

	try {
		const randomAddressDelegatee = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()
		const walletDelegatee = new ethers.Wallet(randomAddressDelegatee);
		addresses.delegateeAddress = walletDelegatee.address;
		console.log("Address Delegatee: " + walletDelegatee.address);
	} catch (e) {
		console.log(e)
	}

	delegateAddresses[i] = addresses
}

async function main () {
	for (const delegates of delegateAddresses) {
		const signer = new ethers.Wallet(delegates.delegatlorPK, provider)
		const delegatesContract = new ethers.Contract(delegateAddress, parsedDelegates.abi, signer);
		const token = new ethers.Contract(gnoAddress, parsedToken.abi, signer);

		const balanceDelegator = await token.balanceOf(delegates.delegatorAddress)
		console.log(balanceDelegator.toString())

		const Delegation_1 = {
			delegate: delegates.delegateeAddress,
			ratio: 20 // TODO random number ratio?
		}
		const Delegation_2 = {
			delegate: delegates.delegateeAddress,
			ratio: 20 // TODO random number ratio?
		}
		const Delegation_3 = {
			delegate: delegates.delegateeAddress,
			ratio: 20 // TODO random number ratio?
		}

		const delsArray = [Delegation_1, Delegation_2, Delegation_3]
		console.log("-----------")
		const delegate = await delegatesContract.setDelegation(config.context, delsArray, 18446744073709551615)
	}
}

main()
