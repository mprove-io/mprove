import type { ToBackendOperationRegistry } from './to-backend-operation-registry';
import type { toBackendRouteOperations } from './to-backend-route-operations';

export type ToBackendRouteRegistry = {
  [TRoute in keyof typeof toBackendRouteOperations]: ToBackendOperationRegistry[(typeof toBackendRouteOperations)[TRoute]];
};
