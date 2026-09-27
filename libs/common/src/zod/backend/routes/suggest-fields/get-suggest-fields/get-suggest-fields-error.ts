import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetSuggestFieldsError = BackendError;

export let zToBackendGetSuggestFieldsError = zBackendError;

assertTypesEqual<
  ToBackendGetSuggestFieldsError,
  z.infer<typeof zToBackendGetSuggestFieldsError>
>({ value: true });
