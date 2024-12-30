import { hash, stark, num } from 'starknet';

export async function generateConsentProof(
  patientId: string, 
  entityId: string,
  purpose: string
): Promise<{ proof: string, timestamp: number }> {
  // Convert inputs to felt format by hashing strings first
  const patientIdFelt = hash.getSelectorFromName(patientId);
  const entityIdFelt = hash.getSelectorFromName(entityId);
  const purposeHash = hash.getSelectorFromName(purpose);
  
  // Current timestamp in seconds
  const timestamp = Math.floor(Date.now() / 1000);
  const timestampFelt = num.toHex(timestamp.toString());

  // Chain Pedersen hashes for all parameters
  const hash1 = hash.computePedersenHash(patientIdFelt, entityIdFelt);
  const hash2 = hash.computePedersenHash(hash1, purposeHash); 
  const messageHash = hash.computePedersenHash(hash2, timestampFelt);

  
  return {
    proof: messageHash,
    timestamp
  };
}