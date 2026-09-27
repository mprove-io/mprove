import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSaveCreateDashboardError = BackendError;

export let zToBackendSaveCreateDashboardError = zBackendError;

assertTypesEqual<
  ToBackendSaveCreateDashboardError,
  z.infer<typeof zToBackendSaveCreateDashboardError>
>({ value: true });
