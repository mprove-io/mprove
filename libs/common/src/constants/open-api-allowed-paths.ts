import type { ToBackendTelemetryRoute } from '#common/types/to-backend-telemetry-route';
import { toBackendRouteOperations } from '#common/zod/backend/request/to-backend-route-operations';

const telemetryRoutes: ToBackendTelemetryRoute[] = [
  'api/ToBackendTelemetryLogs',
  'api/ToBackendTelemetryMetrics',
  'api/ToBackendTelemetryTraces'
];

export const OPEN_API_ALLOWED_PATHS: Set<string> = new Set([
  ...Object.keys(toBackendRouteOperations).map(route => `/${route}`),
  ...telemetryRoutes.map(route => `/${route}`),
  '/api/ToBackendCheck',
  '/api/sse/session-events'
]);
