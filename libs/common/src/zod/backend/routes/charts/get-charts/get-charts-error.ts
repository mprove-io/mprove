import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetChartsError = BackendError;

export let zToBackendGetChartsError = zBackendError;

assertTypesEqual<
  ToBackendGetChartsError,
  z.infer<typeof zToBackendGetChartsError>
>({ value: true });
