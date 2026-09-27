import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendCreateEditorSessionError = BackendError;

export let zToBackendCreateEditorSessionError = zBackendError;

assertTypesEqual<
  ToBackendCreateEditorSessionError,
  z.infer<typeof zToBackendCreateEditorSessionError>
>({ value: true });
