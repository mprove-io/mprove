import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteDraftDashboardsError = BackendError;

export let zToBackendDeleteDraftDashboardsError = zBackendError;

assertTypesEqual<
  ToBackendDeleteDraftDashboardsError,
  z.infer<typeof zToBackendDeleteDraftDashboardsError>
>({ value: true });
