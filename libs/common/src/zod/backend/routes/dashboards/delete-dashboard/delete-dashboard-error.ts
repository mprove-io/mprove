import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteDashboardError = BackendError;

export let zToBackendDeleteDashboardError = zBackendError;

assertTypesEqual<
  ToBackendDeleteDashboardError,
  z.infer<typeof zToBackendDeleteDashboardError>
>({ value: true });
