import {
  RpcClient,
  JsonRpcClient,
  RpcMutateParams,
  RpcQueryParams,
  RpcMutateResponse,
  RpcQueryResponse,
  WsSubscriptionsClient,
  NodeEvent
} from '@calimero-network/calimero-client';
import { ClientApi } from '../clientApi';
import { getContextId, getNodeUrl } from '../../utils/node';
import { PatientRecord } from '../../types/HealthTypes';

// Define interfaces for request/response types
interface AuthorizedRecordsResponse {
  records: PatientRecord[];
}

interface AccessRequestArgs {
  patient_id: string;
}

export class ClientApiDataSource implements ClientApi {
  private rpcClient: RpcClient;
  private subscriptionsClient: WsSubscriptionsClient;
  private applicationId: string;

  constructor() {
    const nodeUrl = process.env.VITE_NODE_URL ?? '';
    this.applicationId = process.env.VITE_APPLICATION_ID ?? '';
    
    // Initialize RPC client
    this.rpcClient = new JsonRpcClient(nodeUrl, '/jsonrpc');
    
    // Initialize WebSocket client
    this.subscriptionsClient = new WsSubscriptionsClient(nodeUrl, '/ws');
    this.initializeSubscriptions();
  }

  private async initializeSubscriptions() {
    try {
      await this.subscriptionsClient.connect();
      this.subscriptionsClient.subscribe([this.applicationId]);
      this.subscriptionsClient.addCallback((data: NodeEvent) => {
        console.log('Received event:', data);
      });
    } catch (error) {
      console.error('Failed to initialize subscriptions:', error);
    }
  }

  async getAuthorizedRecords(): Promise<RpcQueryResponse<PatientRecord[]>> {
    const params: RpcQueryParams<{}> = {
      applicationId: this.applicationId,
      method: 'get_authorized_records',
      argsJson: {},
    };

    return await this.rpcClient.query<{}, AuthorizedRecordsResponse>(params);
  }

  async requestAccess(patientId: string): Promise<RpcMutateResponse<boolean>> {
    const params: RpcMutateParams<AccessRequestArgs> = {
      applicationId: this.applicationId,
      method: 'request_access',
      argsJson: {
        patient_id: patientId
      },
    };

    return await this.rpcClient.mutate<AccessRequestArgs, boolean>(params);
  }

  // Cleanup method to close WebSocket connection
  async cleanup() {
    if (this.subscriptionsClient) {
      await this.subscriptionsClient.disconnect();
    }
  }
}

// Export singleton instance
export const clientApi = new ClientApiDataSource();