import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendFetchFailedError,
  zBackendFetchFailedError
} from '#common/types/backend/errors/backend-fetch-failed-error';
import {
  type BackendFetchTimeoutError,
  zBackendFetchTimeoutError
} from '#common/types/backend/errors/backend-fetch-timeout-error';
import {
  type BackendHashSecretIsNotDefinedError,
  zBackendHashSecretIsNotDefinedError
} from '#common/types/backend/errors/backend-hash-secret-is-not-defined-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';
import {
  type BackendRefetchFromOpencodeFailedError,
  zBackendRefetchFromOpencodeFailedError
} from '#common/types/backend/errors/backend-refetch-from-opencode-failed-error';
import {
  type BackendSchedulerPublishReloadSessionFailedError,
  zBackendSchedulerPublishReloadSessionFailedError
} from '#common/types/backend/errors/backend-scheduler-publish-reload-session-failed-error';
import {
  type BackendSessionNotFoundError,
  zBackendSessionNotFoundError
} from '#common/types/backend/errors/backend-session-not-found-error';
import {
  type BackendSseStreamFailedError,
  zBackendSseStreamFailedError
} from '#common/types/backend/errors/backend-sse-stream-failed-error';

export type ToBackendGetSessionError =
  | BackendFetchFailedError
  | BackendFetchTimeoutError
  | BackendHashSecretIsNotDefinedError
  | BackendProjectDoesNotExistError
  | BackendRefetchFromOpencodeFailedError
  | BackendSchedulerPublishReloadSessionFailedError
  | BackendSessionNotFoundError
  | BackendSseStreamFailedError;

export let zToBackendGetSessionError = z.discriminatedUnion('code', [
  zBackendFetchFailedError,
  zBackendFetchTimeoutError,
  zBackendHashSecretIsNotDefinedError,
  zBackendProjectDoesNotExistError,
  zBackendRefetchFromOpencodeFailedError,
  zBackendSchedulerPublishReloadSessionFailedError,
  zBackendSessionNotFoundError,
  zBackendSseStreamFailedError
]);

assertTypesEqual<
  ToBackendGetSessionError,
  z.infer<typeof zToBackendGetSessionError>
>({ value: true });
