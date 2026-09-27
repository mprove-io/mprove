import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendSendMessageToExplorerSessionError = BackendError;

export let zToBackendSendMessageToExplorerSessionError = zBackendError;

assertTypesEqual<
  ToBackendSendMessageToExplorerSessionError,
  z.infer<typeof zToBackendSendMessageToExplorerSessionError>
>({ value: true });
