import { getJWTObject } from './storage';
import { hash } from 'starknet';

export function getUserID(): string {
    const jwtObject = getJWTObject();
    if (jwtObject) {
        const hashedId = hash.getSelectorFromName(jwtObject.executor_public_key);
        return hashedId.substring(0, 31);
    }
    return '';
}