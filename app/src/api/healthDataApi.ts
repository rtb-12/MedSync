import {
  ApiResponse,
  JsonRpcClient,
  RequestConfig,
  RpcError,
} from '@calimero-network/calimero-client';
import { PatientRecord } from '../types/HealthTypes';
import { getJWTObject } from '../utils/storage';
import { createJwtHeader } from '../utils/jwtHeaders';
import { getContextId } from '../utils/node';
import { ClientMethod } from './clientApi';

interface StorePatientDataArgs {
  patient_id: string;
  encrypted_data: number[];
  record_type: string;
}
export interface PatientRecord {
  data: string;
  timestamp: number;
  record_type: string;
  owner_id: string;
  authorized_ids: string[];
  is_anonymized: boolean;
}
interface AccessRequestArgs {
  patient_id: string;
}

export class HealthDataApi {
  private rpcClient: JsonRpcClient;
  private applicationId: string;

  constructor() {
    this.rpcClient = new JsonRpcClient(
      import.meta.env.VITE_NODE_URL ?? '',
      '/jsonrpc',
    );
    this.applicationId = import.meta.env.VITE_APPLICATION_ID ?? '';
  }

  private getConfigAndJwt() {
    const jwtObject = getJWTObject();
    const headers = createJwtHeader();

    if (!headers || !jwtObject || !jwtObject.executor_public_key) {
      return {
        error: { message: 'Authentication failed', code: 401 },
      };
    }

    return {
      jwtObject,
      config: {
        headers,
        timeout: 30000,
      },
    };
  }

  async getPatientRecords(): Promise<ApiResponse<PatientRecord[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.GET_PATIENT_RECORDS,
        argsJson: {
          patient_id: jwtObject.executor_public_key,
          entity_id: jwtObject.executor_public_key,
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (response?.error) {
      return { error: response.error };
    }

    const recordData = response?.result?.output;
    if (!recordData) {
      return { data: [], error: null };
    }

    const textDecoder = new TextDecoder();
    const record: PatientRecord = {
      data: textDecoder.decode(new Uint8Array(recordData.data)),
      timestamp: Number(recordData.timestamp) / 1000000, // Convert nanoseconds to milliseconds
      record_type: recordData.record_type,
      owner_id: jwtObject.executor_public_key,
      authorized_ids: [],
      is_anonymized: false,
    };
    console.log("data",record);
    return {
      data: [record],
  
      error: null,
    };
  }

  async storePatientData(
    encryptedData: Uint8Array,
    recordType: string,
  ): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }
    console.log('=== Store Patient Data Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Patient ID:', jwtObject.executor_public_key);
    console.log('Record Type:', recordType);
    console.log('Data Size:', encryptedData.length, 'bytes');

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.STORE_PATIENT_DATA,
      argsJson: {
        patient_id: jwtObject.executor_public_key,
        encrypted_data: Array.from(encryptedData),
        record_type: recordType,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('Request Parameters:', JSON.stringify(requestParams, null, 2));

    const response = await this.rpcClient.execute(requestParams, config);

    if (response?.error) {
      console.error('API Error:', response.error);
      return { error: response.error };
    }

    console.log('=== Store Patient Data Response ===');
    console.log('Success:', true);
    console.log('Timestamp:', new Date().toISOString());

    return { data: true, error: null };
  }

  async getAuthorizedRecords(): Promise<ApiResponse<PatientRecord[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const response = await this.rpcClient.query(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.GET_AUTHORIZED_RECORDS,
        argsJson: {},
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (response?.error) {
      return { error: response.error };
    }

    return {
      data: response?.result?.records ?? [],
      error: null,
    };
  }

  async requestAccess(patientId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const response = await this.rpcClient.execute(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.REQUEST_ACCESS,
        argsJson: { patient_id: patientId },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (response?.error) {
      return { error: response.error };
    }

    return { data: true, error: null };
  }

  async removeRecord(patientId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const response = await this.rpcClient.execute(
      {
        contextId: jwtObject?.context_id ?? getContextId(),
        method: ClientMethod.REMOVE_RECORD,
        argsJson: { patient_id: patientId },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (response?.error) {
      return { error: response.error };
    }

    return { data: true, error: null };
  }
}
