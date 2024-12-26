// src/types/HealthTypes.ts
export interface PatientRecord {
  encrypted_data: Uint8Array;
  data: string;
  timestamp: number;
  record_type: string;
  owner_id: string;
  authorized_ids: string[];
  is_anonymized: boolean;
}

export interface ConsentPolicy {
  patient_id: string;
  entity_id: string;
  purpose: string;
  expiration: number;
}