import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendPollUserCodexAuthError = BackendError;

export let zToBackendPollUserCodexAuthError = zBackendError;

assertTypesEqual<
  ToBackendPollUserCodexAuthError,
  z.infer<typeof zToBackendPollUserCodexAuthError>
>({ value: true });
