import type { ToBackendOperation } from '#common/types/backend/request/to-backend-operation';
import { toBackendRouteOperations } from '#common/types/backend/request/to-backend-route-operations';
import type { ToBackendRoute } from '#common/types/to-backend-route';

export function getToBackendOperation(item: {
  path: string;
}): ToBackendOperation {
  let { path } = item;

  let route: string = path.split('?')[0].replace(/^\/+|\/+$/g, '');

  let operation: ToBackendOperation = Object.prototype.hasOwnProperty.call(
    toBackendRouteOperations,
    route
  )
    ? toBackendRouteOperations[route as ToBackendRoute]
    : undefined;

  return operation;
}
