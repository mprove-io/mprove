import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDuplicateMconfigAndQueryError = BackendError;

export let zToBackendDuplicateMconfigAndQueryError = zBackendError;

assertTypesEqual<
  ToBackendDuplicateMconfigAndQueryError,
  z.infer<typeof zToBackendDuplicateMconfigAndQueryError>
>({ value: true });
