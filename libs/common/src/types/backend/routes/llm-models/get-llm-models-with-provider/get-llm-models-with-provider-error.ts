import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type BackendProjectDoesNotExistError,
  zBackendProjectDoesNotExistError
} from '#common/types/backend/errors/backend-project-does-not-exist-error';

export type ToBackendGetLlmModelsWithProviderError =
  | BackendMemberDoesNotExistError
  | BackendProjectDoesNotExistError;

export let zToBackendGetLlmModelsWithProviderError = z.discriminatedUnion(
  'code',
  [zBackendMemberDoesNotExistError, zBackendProjectDoesNotExistError]
);

assertTypesEqual<
  ToBackendGetLlmModelsWithProviderError,
  z.infer<typeof zToBackendGetLlmModelsWithProviderError>
>({ value: true });
