import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateFolderError = BackendError;

export let zToBackendCreateFolderError = zBackendError;

assertTypesEqual<
  ToBackendCreateFolderError,
  z.infer<typeof zToBackendCreateFolderError>
>({ value: true });
