import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateDraftDashboardError = BackendError;

export let zToBackendCreateDraftDashboardError = zBackendError;

assertTypesEqual<
  ToBackendCreateDraftDashboardError,
  z.infer<typeof zToBackendCreateDraftDashboardError>
>({ value: true });
