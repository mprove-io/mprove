import type { ToBackendTelemetryRoute } from '#common/types/to-backend-telemetry-route';
import { toBackendRouteRegistry } from '#common/zod/backend/request/to-backend-route-registry';

const telemetryRoutes: ToBackendTelemetryRoute[] = [
  'api/ToBackendTelemetryLogs',
  'api/ToBackendTelemetryMetrics',
  'api/ToBackendTelemetryTraces'
];

export const OPEN_API_ALLOWED_PATHS: Set<string> = new Set([
  ...Object.keys(toBackendRouteRegistry).map(route => `/${route}`),
  ...telemetryRoutes.map(route => `/${route}`),
  '/api/ToBackendCheck',
  '/api/sse/session-events'
]);
