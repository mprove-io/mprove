import type { ToBackendInputForRoute } from '#common/types/to-backend-input-for-route';
import type { ToBackendRoute } from '#common/types/to-backend-route';
import type { ToBackendRequestForRoute } from '#common/zod/backend/request/to-backend-request-for-route';
import { toBackendRouteOperations } from '#common/zod/backend/request/to-backend-route-operations';

export function makeToBackendRequest<TRoute extends ToBackendRoute>(item: {
  route: TRoute;
  traceId: string;
  idempotencyKey: string;
  input: ToBackendInputForRoute<NoInfer<TRoute>>;
}): ToBackendRequestForRoute<TRoute> {
  let { route, traceId, idempotencyKey, input } = item;

  // The route determines both the operation and input; TypeScript cannot
  // preserve that correlation when constructing an indexed union generically.
  let request: ToBackendRequestForRoute<TRoute> = {
    operation: toBackendRouteOperations[route],
    traceId: traceId,
    idempotencyKey: idempotencyKey,
    input: input
  } as ToBackendRequestForRoute<TRoute>;

  return request;
}
