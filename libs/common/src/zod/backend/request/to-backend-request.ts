import type { ToBackendOperation } from './to-backend-operation';
import type { ToBackendRequestForOperation } from './to-backend-request-for-operation';

export type ToBackendRequest = ToBackendRequestForOperation<ToBackendOperation>;
