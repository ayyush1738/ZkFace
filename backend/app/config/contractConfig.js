import dotenv from 'dotenv';
dotenv.config();

export const CONTRACT_ADDRESS = "0xc8c2Ad8Ac303E3DA550Bd6eca11ab4c3f566A683";
export const CONTRACT_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256[2]",
				"name": "_pA",
				"type": "uint256[2]"
			},
			{
				"internalType": "uint256[2][2]",
				"name": "_pB",
				"type": "uint256[2][2]"
			},
			{
				"internalType": "uint256[2]",
				"name": "_pC",
				"type": "uint256[2]"
			},
			{
				"internalType": "uint256[1]",
				"name": "_pubSignals",
				"type": "uint256[1]"
			}
		],
		"name": "verifyProof",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
export const PRIVATE_KEY = process.env.PRIVATE_KEY;
export const RPC_URL = "https://sepolia.era.zksync.dev"; 