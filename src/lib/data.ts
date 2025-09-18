import { format } from 'date-fns';

export interface Produce {
  id: string;
  produceName: string;
  numberOfUnits: number;
  quality: 'Grade A' | 'Grade B' | 'Grade C';
  farmerId: string;
  middlemanId?: string;
  blockchainTransactionHash?: string;
  status: 'Request Pending' | 'Sold' | 'Processed';
  statusHistory: { status: string; timestamp: string }[];
}

// Mock user data
export const mockUsers = {
    farmer_01: { name: 'Green Valley Farms' },
    farmer_02: { name: 'Sunshine Orchards' },
    middleman_01: { name: 'Fresh Produce Distributors' },
};


const initialProduce: Produce[] = [
  {
    id: 'prod_1a2b3c',
    produceName: 'Organic Tomatoes',
    numberOfUnits: 150,
    quality: 'Grade A',
    farmerId: 'farmer_01',
    status: 'Sold',
    statusHistory: [
      { status: 'Request Pending', timestamp: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'PPpp') },
      { status: 'Sold', timestamp: format(new Date(), 'PPpp') }
    ],
    middlemanId: 'middleman_01',
    blockchainTransactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
  {
    id: 'prod_4d5e6f',
    produceName: 'Crisp Lettuce',
    numberOfUnits: 300,
    quality: 'Grade B',
    farmerId: 'farmer_01',
    status: 'Request Pending',
    statusHistory: [
      { status: 'Request Pending', timestamp: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'PPpp') }
    ]
  },
  {
    id: 'prod_7g8h9i',
    produceName: 'Sweet Corn',
    numberOfUnits: 500,
    quality: 'Grade A',
    farmerId: 'farmer_02',
    status: 'Processed',
    statusHistory: [
      { status: 'Sold', timestamp: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'PPpp') },
      { status: 'Processed', timestamp: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'PPpp') }
    ],
    middlemanId: 'middleman_01',
    blockchainTransactionHash: '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
  },
];

let produceData: Produce[] = [...initialProduce];

// Simulate async Firestore calls
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Mock Blockchain Service ---
async function recordTransactionOnBlockchain(produce: Produce, middlemanId: string): Promise<string> {
    await delay(750); // Simulate network latency for a blockchain transaction
    console.log("Recording transaction to blockchain for produce:", produce.id);
    console.log("Farmer:", mockUsers[produce.farmerId as keyof typeof mockUsers].name);
    console.log("Middleman:", mockUsers[middlemanId as keyof typeof mockUsers].name);
    console.log("Produce:", produce.produceName);
    console.log("Quantity:", produce.numberOfUnits);
    console.log("Quality:", produce.quality);
    // Return a mock transaction hash
    return '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
}
// -----------------------------


export async function getProduceForFarmer(farmerId: string): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.farmerId === farmerId).sort((a, b) => new Date(b.statusHistory[0].timestamp).getTime() - new Date(a.statusHistory[0].timestamp).getTime());
}

export async function getPendingProduce(): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.status === 'Request Pending').sort((a, b) => new Date(a.statusHistory[0].timestamp).getTime() - new Date(b.statusHistory[0].timestamp).getTime());
}

export async function getSoldProduce(): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.status === 'Sold').sort((a, b) => new Date(a.statusHistory[0].timestamp).getTime() - new Date(b.statusHistory[0].timestamp).getTime());
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

export async function approveAndSellProduce(produceId: string, middlemanId: string): Promise<Produce | undefined> {
    const produceIndex = produceData.findIndex(p => p.id === produceId);
    if (produceIndex === -1) {
        return undefined;
    }

    const produceToUpdate = produceData[produceIndex];

    // This is where you would interact with your real blockchain.
    // We are calling our mock service instead.
    const txHash = await recordTransactionOnBlockchain(produceToUpdate, middlemanId);

    // Now update the local data with the new status and blockchain info
    produceToUpdate.status = 'Sold';
    produceToUpdate.middlemanId = middlemanId;
    produceToUpdate.blockchainTransactionHash = txHash;
    produceToUpdate.statusHistory.push({ status: 'Sold', timestamp: format(new Date(), 'PPpp') });

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