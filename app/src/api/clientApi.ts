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
  ADD_CONSENT = 'add_consent',
  ACCESS_PATIENT_DATA = 'access_patient_data',
  LIST_AUTHORIZED_REPORTS = 'list_authorized_reports',
  CREATE_RESEARCH_POOL = 'create_research_pool',
  GET_RESEARCH_POOL = 'get_research_pool',
  REVOKE_ACCESS = 'revoke_access',
  DELETE_PATIENT_DATA = 'delete_patient_data',
  UPDATE_RESEARCH_POOL = 'update_research_pool',
  DELETE_RESEARCH_POOL = 'delete_research_pool',
  UPDATE_PATIENT_DATA = 'update_patient_data',
  LIST_RESEARCH_POOLS = 'list_research_pools',
  UPDATE_SUBMISSION_STATUS = 'update_submission_status',
  GET_POOL_SUBMISSIONS    = 'get_pool_submissions',
  SUBMIT_TO_POOL = 'submit_to_pool',

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