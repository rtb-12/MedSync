import { ApiResponse } from '@calimero-network/calimero-client';
import { PatientRecord } from '../types/HealthTypes';

export interface StorePatientDataRequest {
  patient_id: string;
  encrypted_data: Uint8Array;
  record_type: string;
}

export interface GrantConsentRequest {
  patient_id: string;
  entity_id: string;
  purpose: string;
  proof: Uint8Array;
}

export enum ClientMethod {
  GET_PATIENT_RECORDS = 'get_patient_data',
  STORE_PATIENT_DATA = 'store_patient_data',
  GET_AUTHORIZED_RECORDS = 'get_authorized_records',
  REQUEST_ACCESS = 'request_access',
  GRANT_ACCESS = 'grant_access',
  REVOKE_ACCESS = 'revoke_access',
  REMOVE_RECORD = 'remove_record'
}

export interface ClientApi {
  getPatientRecords(): Promise<ApiResponse<PatientRecord[]>>;
  
  storePatientData(
    patientId: string,
    encryptedData: Uint8Array,
    recordType: string
  ): Promise<ApiResponse<boolean>>;
  
  getAuthorizedRecords(): Promise<ApiResponse<PatientRecord[]>>;
  
  requestAccess(patientId: string): Promise<ApiResponse<boolean>>;
  
  removeRecord(patientId: string): Promise<ApiResponse<boolean>>;
  
  grantAccess(
    patientId: string,
    entityId: string,
  ): Promise<ApiResponse<boolean>>;
  
  revokeAccess(
    patientId: string, 
    entityId: string
  ): Promise<ApiResponse<boolean>>;
}