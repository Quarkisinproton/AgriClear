import { format } from 'date-fns';
import { ethers, BrowserProvider, Contract } from 'ethers';

// --- IMPORTANT: Smart Contract Details ---
// You must deploy your contract and paste the address and ABI here.
const contractAddress = '0x1eB038c7C832BeF1BCe3850dB788b518c2cDbd0b';
const contractABI: any[] = [
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "batchId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "produceName",
				"type": "string"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "farmer",
				"type": "address"
			}
		],
		"name": "BatchCreated",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "batchId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "farmer",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "middleman",
				"type": "address"
			}
		],
		"name": "BatchSold",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_batchId",
				"type": "uint256"
			}
		],
		"name": "assignMiddleman",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "batches",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "batchId",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "produceName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "quantity",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "quality",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "farmer",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "middleman",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "timestamp",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_produceName",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_quantity",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "_quality",
				"type": "string"
			}
		],
		"name": "createBatch",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBatchCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "nextBatchId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
// ------------------------------------------

export interface Produce {
  id: string;
  produceName: string;
  numberOfUnits: number;
  quality: 'Grade A' | 'Grade B' | 'Grade C';
  farmerId: string; // This will be the farmer's wallet address
  middlemanId?: string; // This will be the middleman's wallet address
  blockchainTransactionHash?: string;
  status: 'Request Pending' | 'Sold' | 'Processed';
  statusHistory: { status: string; timestamp: string }[];
}

// Mock user data with real wallet addresses
export const mockUsers = {
    '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8': { name: 'Green Valley Farms', role: 'Farmer' },
    '0x33C22589a30a70852131e124e0AcA0f7b1A35824': { name: 'Fresh Produce Distributors', role: 'Middleman' },
};

const initialProduce: Produce[] = [
  {
    id: 'prod_1a2b3c',
    produceName: 'Organic Tomatoes',
    numberOfUnits: 150,
    quality: 'Grade A',
    farmerId: '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8',
    status: 'Sold',
    statusHistory: [
      { status: 'Request Pending', timestamp: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'PPpp') },
      { status: 'Sold', timestamp: format(new Date(), 'PPpp') }
    ],
    middlemanId: '0x33C22589a30a70852131e124e0AcA0f7b1A35824',
    blockchainTransactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
  {
    id: 'prod_4d5e6f',
    produceName: 'Crisp Lettuce',
    numberOfUnits: 300,
    quality: 'Grade B',
    farmerId: '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8',
    status: 'Request Pending',
    statusHistory: [
      { status: 'Request Pending', timestamp: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'PPpp') }
    ]
  },
];

let produceData: Produce[] = [...initialProduce];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));


// --- Real Blockchain Service ---
async function recordTransactionOnBlockchain(
    produce: Produce
): Promise<{ txHash: string, middlemanAddress: string }> {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to continue.');
    }
    if (!contractAddress || contractAddress === '0xA7C44D8cF1C83bD9380456D6562cfEc7B9065B7B') {
        throw new Error('Contract address is not set. Please update it in src/lib/data.ts');
    }

    try {
        // Connect to the user's wallet (MetaMask)
        const provider = new BrowserProvider(window.ethereum);
        
        // This will prompt the user to connect their wallet if not already connected.
        const signer = await provider.getSigner();
        const middlemanAddress = signer.address;
        
        // Create a contract instance
        const supplyChainContract = new Contract(contractAddress, contractABI, signer);

        // Call the 'recordBatch' function on the smart contract
        console.log("Sending transaction to blockchain...");
        const tx = await supplyChainContract.recordBatch(
            produce.farmerId,
            produce.produceName,
            produce.numberOfUnits,
            produce.quality
        );

        // Wait for the transaction to be mined
        console.log('Waiting for transaction to be mined...', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction mined!', receipt);

        // Return the transaction hash and the address that signed it
        return { txHash: receipt.hash, middlemanAddress };
    } catch (error: any) {
        console.error("Blockchain transaction failed:", error);
        // Provide a more user-friendly error message
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction was rejected in MetaMask.');
        }
        if (error.message.includes('Incorrect wallet connected')) {
             throw new Error(error.message); // Re-throw the specific error for the UI to catch
        }
        throw new Error('An unknown error occurred during the blockchain transaction.');
    }
}
// -----------------------------

export async function getProduceForFarmer(farmerId: string): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.farmerId.toLowerCase() === farmerId.toLowerCase()).sort((a, b) => new Date(b.statusHistory[0].timestamp).getTime() - new Date(a.statusHistory[0].timestamp).getTime());
}

export async function getPendingProduce(): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.status === 'Request Pending').sort((a, b) => new Date(a.statusHistory[0].timestamp).getTime() - new Date(b.statusHistory[0].timestamp).getTime());
}

export async function getSoldProduce(): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.status === 'Sold').sort((a, b) => new Date(a.statusHistory[0].timestamp).getTime() - new Date(b.statusHistory[0].timestamp).getTime());
}

export async function getProcessedProduce(): Promise<Produce[]> {
    await delay(500);
    return [...produceData].filter(p => p.status === 'Processed').sort((a, b) => new Date(a.statusHistory[a.statusHistory.length -1].timestamp).getTime() - new Date(b.statusHistory[b.statusHistory.length - 1].timestamp).getTime());
}

export async function getProduceById(id: string): Promise<Produce | undefined> {
  await delay(500);
  return produceData.find(p => p.id === id);
}

export async function addProduce(
  produceName: string,
  numberOfUnits: number,
  quality: Produce['quality'],
  farmerId: string
): Promise<Produce> {
  await delay(500);
  const newProduce: Produce = {
    id: `prod_${Math.random().toString(36).substring(2, 9)}`,
    produceName,
    numberOfUnits,
    quality,
    farmerId,
    status: 'Request Pending',
    statusHistory: [{ status: 'Request Pending', timestamp: format(new Date(), 'PPpp') }],
  };
  produceData.unshift(newProduce);
  return newProduce;
}

export async function approveAndSellProduce(produceId: string): Promise<Produce | undefined> {
    const produceIndex = produceData.findIndex(p => p.id === produceId);
    if (produceIndex === -1) {
        throw new Error("Produce not found.");
    }

    let produceToUpdate = produceData[produceIndex];

    // Call the real blockchain service
    const { txHash, middlemanAddress } = await recordTransactionOnBlockchain(produceToUpdate);

    // Now update the local data with the new status and blockchain info
    produceToUpdate = {
        ...produceToUpdate,
        status: 'Sold',
        middlemanId: middlemanAddress,
        blockchainTransactionHash: txHash,
        statusHistory: [...produceToUpdate.statusHistory, { status: 'Sold', timestamp: format(new Date(), 'PPpp') }]
    };
    
    produceData[produceIndex] = produceToUpdate;
    return produceToUpdate;
}


export async function updateProduceStatus(id: string, status: 'Processed'): Promise<Produce | undefined> {
  await delay(500);
  const produceIndex = produceData.findIndex(p => p.id === id);
  if (produceIndex > -1) {
    produceData[produceIndex].status = status;
    produceData[produceIndex].statusHistory.push({ status, timestamp: format(new Date(), 'PPpp') });
    return produceData[produceIndex];
  }
  return undefined;
}
