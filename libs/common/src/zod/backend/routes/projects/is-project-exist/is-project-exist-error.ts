import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendIsProjectExistError = BackendError;

export let zToBackendIsProjectExistError = zBackendError;

assertTypesEqual<
  ToBackendIsProjectExistError,
  z.infer<typeof zToBackendIsProjectExistError>
>({ value: true });
