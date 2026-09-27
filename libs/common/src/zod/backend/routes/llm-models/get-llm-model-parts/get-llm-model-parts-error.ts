import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetLlmModelPartsError = BackendError;

export let zToBackendGetLlmModelPartsError = zBackendError;

assertTypesEqual<
  ToBackendGetLlmModelPartsError,
  z.infer<typeof zToBackendGetLlmModelPartsError>
>({ value: true });
