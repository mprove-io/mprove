import { toBackendRouteOperations } from '#common/types/backend/request/to-backend-route-operations';
import type { ToBackendTelemetryRoute } from '#common/types/backend/request/to-backend-telemetry-route';

const telemetryRoutes: ToBackendTelemetryRoute[] = [
  'api/ToBackendTelemetryLogs',
  'api/ToBackendTelemetryMetrics',
  'api/ToBackendTelemetryTraces'
];

export const OPEN_API_ALLOWED_PATHS: Set<string> = new Set([
  ...Object.keys(toBackendRouteOperations).map(route => `/${route}`),
  ...telemetryRoutes.map(route => `/${route}`),
  '/api/sse/session-events'
]);
