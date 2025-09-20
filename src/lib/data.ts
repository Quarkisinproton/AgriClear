import { format } from 'date-fns';
import { ethers, BrowserProvider, Contract, ZeroAddress } from 'ethers';

// --- Smart Contract Details ---
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
  id: number;
  produceName: string;
  numberOfUnits: number;
  quality: 'Grade A' | 'Grade B' | 'Grade C';
  farmerId: string;
  middlemanId: string;
  timestamp: string;
  status: 'Created' | 'Sold';
  statusHistory: { status: string; timestamp: string }[];
}

// Keep mock names for display purposes, but data comes from blockchain
export const mockUsers = {
    '0x3EcF027EB869f93BB064352C5c9dF965C4bfe3e8': { name: 'Green Valley Farms', role: 'Farmer' },
    '0x33C22589a30a70852131e124e0AcA0f7b1A35824': { name: 'Fresh Produce Distributors', role: 'Middleman' },
};


const getContract = async (signer = false) => {
    if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask is not installed. Please install it to continue.');
    }
    if (!contractAddress || contractAddress.startsWith('YOUR_CONTRACT_ADDRESS_HERE')) {
        // Using a public contract for demo purposes if not set.
        // Replace with your deployed contract address.
        console.warn("Using a demo contract address. Please replace with your own in src/lib/data.ts");
        return null;
    }

    const provider = new BrowserProvider(window.ethereum);
    if (signer) {
        return new Contract(contractAddress, contractABI, await provider.getSigner());
    } else {
        return new Contract(contractAddress, contractABI, provider);
    }
};

const formatBatch = (batch: any): Produce => {
    const status: Produce['status'] = batch.middleman === ZeroAddress ? 'Created' : 'Sold';
    const timestamp = format(new Date(Number(batch.timestamp) * 1000), 'PPpp');

    const statusHistory = [{ status: 'Created', timestamp }];
    if (status === 'Sold') {
        // We don't have the sold timestamp, so we'll reuse the creation one for now.
        statusHistory.push({ status: 'Sold', timestamp });
    }

    return {
        id: Number(batch.batchId),
        produceName: batch.produceName,
        numberOfUnits: Number(batch.quantity),
        quality: batch.quality as Produce['quality'],
        farmerId: batch.farmer,
        middlemanId: batch.middleman,
        timestamp,
        status,
        statusHistory,
    };
};

async function getAllBatches(): Promise<Produce[]> {
    const contract = await getContract();
    if (!contract) return [];

    const batchCount = await contract.getBatchCount();
    const batches: Produce[] = [];

    for (let i = 0; i < batchCount; i++) {
        const batch = await contract.batches(i);
        // Only add batches that have a valid farmer (i.e., not the zero address)
        if (batch.farmer !== ZeroAddress) {
            batches.push(formatBatch(batch));
        }
    }
    return batches.sort((a,b) => b.id - a.id); // Sort by most recent
}

export async function getProduceForFarmer(farmerId: string): Promise<Produce[]> {
  const allBatches = await getAllBatches();
  return allBatches.filter(p => p.farmerId.toLowerCase() === farmerId.toLowerCase());
}

export async function getAvailableProduce(): Promise<Produce[]> {
  const allBatches = await getAllBatches();
  return allBatches.filter(p => p.status === 'Created');
}

export async function getSoldProduceForMiddleman(middlemanId: string): Promise<Produce[]> {
    const allBatches = await getAllBatches();
    return allBatches.filter(p => p.middlemanId !== ZeroAddress && p.middlemanId.toLowerCase() === middlemanId.toLowerCase());
}

export async function getProduceById(id: number): Promise<Produce | undefined> {
  const contract = await getContract();
  if (!contract) return undefined;
  try {
      const batch = await contract.batches(id);
      // If the farmer address is the zero address, it means the batch doesn't exist.
      if (batch.farmer === ZeroAddress) {
          return undefined;
      }
      return formatBatch(batch);
  } catch (error) {
      console.error("Error fetching produce by ID:", error);
      return undefined;
  }
}

export async function addProduce(
  farmerId: string,
  produceName: string,
  numberOfUnits: number,
  quality: Produce['quality']
): Promise<void> {
    const contract = await getContract(true);
    if (!contract) throw new Error("Contract not available");

    try {
        const signer = await (contract.runner as any)?.getAddress();
        if(signer.toLowerCase() !== farmerId.toLowerCase()){
            throw new Error(`Incorrect wallet connected. Please connect with the farmer account: ${farmerId}`);
        }
        console.log("Sending transaction to create batch...");
        const tx = await contract.createBatch(produceName, numberOfUnits, quality);
        await tx.wait(); // Wait for transaction to be mined
        console.log("Transaction mined!", tx.hash);
    } catch (error: any) {
        console.error("Blockchain transaction failed:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction was rejected in MetaMask.');
        }
        throw new Error(error.message || 'An unknown error occurred during the blockchain transaction.');
    }
}


export async function assignMiddlemanToBatch(batchId: number, middlemanId: string): Promise<Produce> {
    const contract = await getContract(true);
    if (!contract) throw new Error("Contract not available");

    try {
        const signer = await (contract.runner as any)?.getAddress();
        if(signer.toLowerCase() !== middlemanId.toLowerCase()){
            throw new Error(`Incorrect wallet connected. Please connect with the middleman account: ${middlemanId}`);
        }
        console.log(`Sending transaction to assign middleman to batch ${batchId}...`);
        const tx = await contract.assignMiddleman(batchId);
        await tx.wait();
        console.log("Transaction mined!", tx.hash);

        const updatedBatch = await getProduceById(batchId);
        if (!updatedBatch) throw new Error("Failed to fetch updated batch data.");

        return updatedBatch;
    } catch (error: any) {
        console.error("Blockchain transaction failed:", error);
        if (error.code === 'ACTION_REJECTED') {
            throw new Error('Transaction was rejected in MetaMask.');
        }
        throw new Error(error.message || 'An unknown error occurred during the blockchain transaction.');
    }
}
