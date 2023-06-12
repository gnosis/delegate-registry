import { ethers, network } from "hardhat"
import * as fs from 'fs';

const parsedToken = JSON.parse(fs.readFileSync("./artifacts/contracts/Token.sol/Token.json"));
const parsedDelegates = JSON.parse(fs.readFileSync("./build/artifacts/contracts/Delegates.sol/Delegates.json"));

const { INFURA_KEY, PK } = process.env;

// Config
const config = {
	numberOfDelegators: 1,
	CHAIN_ID: 5,
	INFURA_KEY: INFURA_KEY,
	context: "gnosis.eth"
}

const provider = new ethers.providers.InfuraProvider(config.CHAIN_ID, config.INFURA_KEY)

const delegateAddress = "0xd1003c7157d30F39C524A16D97131dF39ee72fD9"
const gnoAddress= "0xE666Ad68a6e2897CD06A9ff378ED8b0d71093398"

const signer = new ethers.Wallet(PK, provider)
console.log(signer.address)
const delegatesContract = new ethers.Contract(delegateAddress, parsedDelegates.abi, signer);
const token = new ethers.Contract(gnoAddress, parsedToken.abi, signer);

let delegateAddresses = []

for (let i = 0; i < config.numberOfDelegators; i++) {
	let addresses = {}
	try {
	  const randomAddressDelegator = ethers.BigNumber.from(ethers.utils.randomBytes(32)).toHexString()
	  console.log(randomAddressDelegator)
		const walletDelegator = new ethers.Wallet(randomAddressDelegator);
		addresses.delegatlorPK = randomAddressDelegator
		addresses.delegatorAddress = walletDelegator.address;
		addresses.delegatorAddressBytes = ethers.BigNumber.from(ethers.utils.randomBytes(32))
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
		const balanceDelegator = await token.balanceOf(delegates.delegatorAddress)
		console.log(balanceDelegator.toString())

		const singleDelegation = [
		{
			  delegate:
			    delegates.delegatorAddressBytes,
			  ratio: 6,
			},
		]

		const Delegation_1 = {
			delegate: "0x00",
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
		let num = new ethers.BigNumber.from("18446744073709551615")
		const delegate = await delegatesContract.setDelegation(delegates.delegateeAddress, "gnosis.eth", singleDelegation, num)	}
}

main()
