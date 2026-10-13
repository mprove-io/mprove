import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendInteractFailedError,
  zBackendInteractFailedError
} from '#common/types/backend/errors/backend-interact-failed-error';
import {
  type BackendInteractTimeoutError,
  zBackendInteractTimeoutError
} from '#common/types/backend/errors/backend-interact-timeout-error';

export type PublishInteractCommandError =
  | BackendInteractTimeoutError
  | BackendInteractFailedError;

export let zPublishInteractCommandError = z.union([
  zBackendInteractTimeoutError,
  zBackendInteractFailedError
]);

assertTypesEqual<
  PublishInteractCommandError,
  z.infer<typeof zPublishInteractCommandError>
>({ value: true });
