import {
  getApplicationId,
  getJWTObject,
  getStorageAppEndpointKey,
  getStorageContextId,
  setStorageAppEndpointKey,
  setStorageApplicationId,
  setStorageContextId,
  getUserNodeUrl, setUserNodeUrl
} from './storage';

export function getNodeUrl(): string {
  // First check for user-entered URL
  const userUrl = getUserNodeUrl();
  if (userUrl) {
    return userUrl;
  }

  // Fall back to storage or env if no user URL
  let storageKey = getStorageAppEndpointKey();
  if (!storageKey) {
    let envKey: string = import.meta.env['VITE_NODE_URL'] ?? '';
    setStorageAppEndpointKey(envKey);
    return envKey;
  }

  return storageKey ?? '';
}

export function setNodeUrl(url: string): void {
  setUserNodeUrl(url);
}


export function getContextId(): string {
  let storageContextId = getStorageContextId();

  if (!storageContextId) {
    let jwtToken = getJWTObject();
    let envKey: string = jwtToken?.context_id ?? '';
    setStorageContextId(envKey);
    return envKey;
  }

  return storageContextId ?? '';
}

export function getNearEnvironment(): string {
  return import.meta.env['VITE_NEAR_ENVIRONMENT'] ?? 'testnet';
}

export function getStorageApplicationId(): string {
  let storageApplicationId = getApplicationId();

  if (!storageApplicationId) {
    let envKey: string = import.meta.env['VITE_APPLICATION_ID'] ?? '';
    setStorageApplicationId(envKey);
    return envKey;
  }

  return storageApplicationId ?? '';
}
