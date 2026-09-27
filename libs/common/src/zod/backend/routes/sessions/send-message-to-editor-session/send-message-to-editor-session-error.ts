import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSendMessageToEditorSessionError = BackendError;

export let zToBackendSendMessageToEditorSessionError = zBackendError;

assertTypesEqual<
  ToBackendSendMessageToEditorSessionError,
  z.infer<typeof zToBackendSendMessageToEditorSessionError>
>({ value: true });
