import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export const toBackendTelemetryRouteValues = [
  'api/ToBackendTelemetryLogs',
  'api/ToBackendTelemetryMetrics',
  'api/ToBackendTelemetryTraces'
] as const;

export type ToBackendTelemetryRoute =
  (typeof toBackendTelemetryRouteValues)[number];

export let zToBackendTelemetryRoute = z.enum(toBackendTelemetryRouteValues);

assertTypesEqual<
  ToBackendTelemetryRoute,
  z.infer<typeof zToBackendTelemetryRoute>
>({
  value: true
});
