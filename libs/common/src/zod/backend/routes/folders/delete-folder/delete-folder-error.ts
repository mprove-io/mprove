import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendDeleteFolderError = BackendError;

export let zToBackendDeleteFolderError = zBackendError;

assertTypesEqual<
  ToBackendDeleteFolderError,
  z.infer<typeof zToBackendDeleteFolderError>
>({ value: true });
