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
import { getNodeUrl } from '../utils/node';
import { getUserID  } from '../utils/UserIdGenerate';
interface StorePatientDataArgs {
  patient_id: string;
  encrypted_data: number[];
  record_type: string;
}
interface AddConsentArgs {
  patient_id: string;
  entity_id: string;
  purpose: string;
  starknet_proof: number[]; // byte array for proof
}
interface AccessRequestArgs {
  patient_id: string;
}

interface ResearchPool {
  title: string;
  description: string;
  reward_amount: number;
  entity_id: string;
  created_at: number;
  status: string;
}

interface CreateResearchPoolArgs {
  entity_id: string;
  title: string;
  description: string;
  reward_amount: number;
}

// Add interface for update args
interface UpdateResearchPoolArgs {
  entity_id: string;
  title?: string; 
  description?: string;
  reward_amount?: number;
  status?: string;
}

interface PoolSubmission {
  patient_id: string;
  entity_id: string;
  submitted_at: number;
  status: string;
}
const userId = getUserID();
export class HealthDataApi {
  private rpcClient: JsonRpcClient;
  private applicationId: string;

  constructor() {
    this.rpcClient = new JsonRpcClient(
      getNodeUrl(), 
      '/jsonrpc',
    );
    this.applicationId = import.meta.env.VITE_APPLICATION_ID ?? '';
    // console.log('Application ID:', this.applicationId);
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
          patient_id: userId,
          entity_id: userId,
        },
        executorPublicKey: jwtObject.executor_public_key,
      },
      config,
    );

    if (response?.error) {
      return { error: response.error };
    }

    const recordData = response?.result?.output as { data: number[], timestamp: number, record_type: string } | undefined;
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
    console.log('data', record);
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
        patient_id: userId,
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
  async addConsent(
    entityId: string,
    purpose?: string,
    starknetProof?: string,
  ): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }
    const finalPurpose = purpose || 'data_access';
    const finalProof = starknetProof || '';

    console.log('=== Add Consent Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Patient ID:', jwtObject.executor_public_key);
    console.log('Entity ID:', entityId);
    console.log('Purpose:', purpose);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.ADD_CONSENT,
      argsJson: {
        patient_id: userId,
        entity_id: entityId,
        purpose: finalPurpose,
        starknet_proof: finalProof,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('Request Parameters:', requestParams, null, 2);

    try {
      const response = await this.rpcClient.execute(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      console.log('=== Add Consent Response ===');
      console.log('Success:', true);
      console.log('Timestamp:', new Date().toISOString());

      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to add consent:', err);
      return {
        error: {
          message: 'Failed to add consent',
          code: 500,
        },
      };
    }
  }

  async accessPatientData(
    patientId: string,
    entityId: string,
  ): Promise<ApiResponse<Uint8Array>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Access Patient Data Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Patient ID:', patientId);
    console.log('Entity ID:', entityId);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.ACCESS_PATIENT_DATA,
      argsJson: {
        patient_id: patientId,
        entity_id: entityId,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    console.log('Request Parameters:', JSON.stringify(requestParams, null, 2));

    try {
      const response = await this.rpcClient.query(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      const data = response?.result?.output;
      if (!data) {
        return {
          error: {
            message: 'No data found or access denied',
            code: 404,
          },
        };
      }

      // Convert array data to Uint8Array
      const encryptedData = new Uint8Array(data);

      console.log('=== Access Patient Data Response ===');
      console.log('Success:', true);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Data Size:', encryptedData.length, 'bytes');

      return { data: encryptedData, error: null };
    } catch (err) {
      console.error('Failed to access patient data:', err);
      return {
        error: {
          message: 'Failed to access patient data',
          code: 500,
        },
      };
    }
  }

  async listAuthorizedReports(): Promise<ApiResponse<PatientRecord[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== List Authorized Reports Request ===');
    console.log('Timestamp:', new Date().toISOString());


    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.LIST_AUTHORIZED_REPORTS,
      argsJson: {
        entity_id: userId,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.query(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      const records = response?.result?.output ?? [];

      // Convert backend records to frontend format
      const patientRecords: PatientRecord[] = records.map((record) => ({
        data: new TextDecoder().decode(new Uint8Array(record.data)),
        timestamp: Number(record.timestamp) / 1000000, // Convert nanoseconds to milliseconds
        record_type: record.record_type,
        owner_id: record.owner_id,
        authorized_ids: record.authorized_ids || [],
        is_anonymized: false,
      }));

      console.log('=== List Authorized Reports Response ===');
      console.log('Success:', true);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Records Found:', patientRecords.length);

      return { data: patientRecords, error: null };
    } catch (err) {
      console.error('Failed to list authorized reports:', err);
      return {
        error: {
          message: 'Failed to list authorized reports',
          code: 500,
        },
      };
    }
  }

  async createResearchPool(
    title: string,
    description: string,
    rewardAmount: number,
    expiryDate: number,  
): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    // Validate expiry date
    const currentTime = Math.floor(Date.now() / 1000);
    if (expiryDate <= currentTime) {
      return {
        error: {
          message: 'Expiry date must be in the future',
          code: 400,
        },
      };
    }

    console.log('=== Create Research Pool Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Entity ID:', userId);
    console.log('Title:', title);
    console.log('Expiry Date:', new Date(expiryDate * 1000).toISOString());

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.CREATE_RESEARCH_POOL,
      argsJson: {
        entity_id: userId,
        title,
        description,
        reward_amount: rewardAmount,
        expiry_date: expiryDate,  // Add expiry to args
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to create research pool:', err);
      return {
        error: {
          message: 'Failed to create research pool',
          code: 500,
        },
      };
    }
}

  async getResearchPool(): Promise<ApiResponse<ResearchPool>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Get Research Pool Request ===');
    console.log('Timestamp:', new Date().toISOString());
    // console.log('Entity ID:', entityId);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_RESEARCH_POOL,
      argsJson: {
        entity_id: userId,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.query(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      const pool = response?.result?.output;
      if (!pool) {
        return {
          error: {
            message: 'Research pool not found',
            code: 404,
          },
        };
      }

      return { data: pool, error: null };
    } catch (err) {
      console.error('Failed to get research pool:', err);
      return {
        error: {
          message: 'Failed to get research pool',
          code: 500,
        },
      };
    }
  }

  async deletePatientData(patientId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.DELETE_PATIENT_DATA,
      argsJson: { patient_id: patientId },
      executorPublicKey: jwtObject.executor_public_key,
    };

    return await this.rpcClient.execute(requestParams, config);
  }

  async updatePatientData(
    patientId: string, 
    newData: Uint8Array,
    recordType: string
  ): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.UPDATE_PATIENT_DATA,
      argsJson: {
        patient_id: patientId,
        new_data: Array.from(newData),
        record_type: recordType
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    return await this.rpcClient.execute(requestParams, config);
  }

  async deleteResearchPool(entityId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Delete Research Pool Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Entity ID:', entityId);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.DELETE_RESEARCH_POOL,
      argsJson: {
        entity_id: entityId
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to delete research pool:', err);
      return {
        error: {
          message: 'Failed to delete research pool',
          code: 500
        }
      };
    }
  }

  async updateResearchPool(
    entityId: string,
    updates: Partial<UpdateResearchPoolArgs>
  ): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Update Research Pool Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Entity ID:', entityId);
    console.log('Updates:', updates);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.UPDATE_RESEARCH_POOL,
      argsJson: {
        entity_id: entityId,
        ...updates
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to update research pool:', err);
      return {
        error: {
          message: 'Failed to update research pool',
          code: 500
        }
      };
    }
  }

  async revokeAccess(entityId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Revoke Access Request ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Patient ID:', jwtObject.executor_public_key);
    console.log('Entity ID:', entityId);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.REVOKE_ACCESS,
      argsJson: {
        patient_id: userId,
        entity_id: entityId
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      console.log('=== Revoke Access Response ===');
      console.log('Success:', true);
      console.log('Timestamp:', new Date().toISOString());

      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to revoke access:', err);
      return {
        error: {
          message: 'Failed to revoke access',
          code: 500
        }
      };
    }
  }

  async listResearchPools(): Promise<ApiResponse<ResearchPool[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== List Research Pools Request ===');
    console.log('Timestamp:', new Date().toISOString());

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.LIST_RESEARCH_POOLS,
      argsJson: {},
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.query(requestParams, config);

      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      const pools = response?.result?.output ?? [];

      // Sort by created_at descending
      pools.sort((a, b) => b.created_at - a.created_at);

      console.log('=== List Research Pools Response ===');
      console.log('Success:', true);
      console.log('Pools found:', pools.length);
      console.log('Timestamp:', new Date().toISOString());

      return { data: pools, error: null };
    } catch (err) {
      console.error('Failed to list research pools:', err);
      return {
        error: {
          message: 'Failed to list research pools',
          code: 500
        }
      };
    }
  }

  async submitToPool(entityId: string): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Submit To Pool Request ===');
    console.log('Entity ID:', entityId);
    console.log('Patient ID:', jwtObject.executor_public_key);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.SUBMIT_TO_POOL,
      argsJson: {
        entity_id: entityId,
        patient_id: userId,
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);
      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }
      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to submit to pool:', err);
      return {
        error: {
          message: 'Failed to submit to pool',
          code: 500
        }
      };
    }
  }

  async getPoolSubmissions(entityId: string): Promise<ApiResponse<PoolSubmission[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_POOL_SUBMISSIONS,
      argsJson: { entity_id: entityId },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.query(requestParams, config);
      return { 
        data: response?.result?.output ?? [],
        error: null 
      };
    } catch (err) {
      console.error('Failed to get pool submissions:', err);
      return {
        error: {
          message: 'Failed to get pool submissions',
          code: 500
        }
      };
    }
  }

  async updateSubmissionStatus(
    entityId: string,
    patientId: string,
    status: string
  ): Promise<ApiResponse<boolean>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) return { error };

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.UPDATE_SUBMISSION_STATUS,
      argsJson: {
        entity_id: entityId,
        patient_id: patientId,
        status
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.execute(requestParams, config);
      if (response?.error) return { error: response.error };
      return { data: true, error: null };
    } catch (err) {
      console.error('Failed to update submission status:', err);
      return {
        error: {
          message: 'Failed to update submission status',
          code: 500
        }
      };
    }
  }

  async getPatientSubmissions(): Promise<ApiResponse<PoolSubmission[]>> {
    const { jwtObject, config, error } = this.getConfigAndJwt();
    if (error) {
      console.error('Authentication Error:', error);
      return { error };
    }

    console.log('=== Get Patient Submissions Request ===');
    console.log('Patient ID:', jwtObject.executor_public_key);

    const requestParams = {
      contextId: jwtObject?.context_id ?? getContextId(),
      method: ClientMethod.GET_PATIENT_SUBMISSIONS,
      argsJson: {
        patient_id: userId
      },
      executorPublicKey: jwtObject.executor_public_key,
    };

    try {
      const response = await this.rpcClient.query(requestParams, config);
      if (response?.error) {
        console.error('API Error:', response.error);
        return { error: response.error };
      }

      const submissions = response?.result?.output ?? [];
      submissions.sort((a, b) => b.submitted_at - a.submitted_at);

      return { data: submissions, error: null };
    } catch (err) {
      console.error('Failed to get patient submissions:', err);
      return {
        error: {
          message: 'Failed to get patient submissions',
          code: 500
        }
      };
    }
  }
}

