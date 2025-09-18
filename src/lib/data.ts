import { format } from 'date-fns';

export interface Produce {
  id: string;
  produceName: string;
  numberOfUnits: number;
  farmerId: string;
  status: 'Harvested' | 'Processed';
  statusHistory: { status: string; timestamp: string }[];
}

const initialProduce: Produce[] = [
  {
    id: 'prod_1a2b3c',
    produceName: 'Organic Tomatoes',
    numberOfUnits: 150,
    farmerId: 'farmer_01',
    status: 'Harvested',
    statusHistory: [
      { status: 'Harvested', timestamp: format(new Date(), 'PPpp') }
    ]
  },
  {
    id: 'prod_4d5e6f',
    produceName: 'Crisp Lettuce',
    numberOfUnits: 300,
    farmerId: 'farmer_01',
    status: 'Harvested',
    statusHistory: [
      { status: 'Harvested', timestamp: format(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), 'PPpp') }
    ]
  },
  {
    id: 'prod_7g8h9i',
    produceName: 'Sweet Corn',
    numberOfUnits: 500,
    farmerId: 'farmer_02',
    status: 'Processed',
    statusHistory: [
      { status: 'Harvested', timestamp: format(new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), 'PPpp') },
      { status: 'Processed', timestamp: format(new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), 'PPpp') }
    ]
  },
];

let produceData: Produce[] = [...initialProduce];

// Simulate async Firestore calls
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export async function getProduceForFarmer(farmerId: string): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.farmerId === farmerId).sort((a, b) => new Date(b.statusHistory[0].timestamp).getTime() - new Date(a.statusHistory[0].timestamp).getTime());
}

export async function getAllHarvestedProduce(): Promise<Produce[]> {
  await delay(500);
  return [...produceData].filter(p => p.status === 'Harvested').sort((a, b) => new Date(a.statusHistory[0].timestamp).getTime() - new Date(b.statusHistory[0].timestamp).getTime());
}

export async function getProduceById(id: string): Promise<Produce | undefined> {
  await delay(500);
  return produceData.find(p => p.id === id);
}

export async function addProduce(
  produceName: string,
  numberOfUnits: number,
  farmerId: string
): Promise<Produce> {
  await delay(500);
  const newProduce: Produce = {
    id: `prod_${Math.random().toString(36).substring(2, 9)}`,
    produceName,
    numberOfUnits,
    farmerId,
    status: 'Harvested',
    statusHistory: [{ status: 'Harvested', timestamp: format(new Date(), 'PPpp') }],
  };
  produceData.unshift(newProduce);
  return newProduce;
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
