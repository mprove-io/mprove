import { toBackendRouteOperations } from '#common/types/backend/request/to-backend-route-operations';
import { toBackendTelemetryRouteValues } from '#common/types/backend/request/to-backend-telemetry-route';

export const OPEN_API_ALLOWED_PATHS: Set<string> = new Set([
  ...Object.keys(toBackendRouteOperations).map(route => `/${route}`),
  ...toBackendTelemetryRouteValues.map(route => `/${route}`),
  '/api/sse/session-events'
]);
