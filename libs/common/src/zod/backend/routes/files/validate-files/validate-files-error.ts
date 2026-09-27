import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendValidateFilesError = BackendError;

export let zToBackendValidateFilesError = zBackendError;

assertTypesEqual<
  ToBackendValidateFilesError,
  z.infer<typeof zToBackendValidateFilesError>
>({ value: true });
