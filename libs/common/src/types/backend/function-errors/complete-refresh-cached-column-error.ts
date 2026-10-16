import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type FetchCachedPartsError,
  zFetchCachedPartsError
} from '#common/types/backend/function-errors/fetch-cached-parts-error';

export type CompleteRefreshCachedColumnError =
  | FetchCachedPartsError
  | DbErrorToError;

export const zCompleteRefreshCachedColumnError = z.union([
  zFetchCachedPartsError,
  zDbErrorToError
]);

assertTypesEqual<
  CompleteRefreshCachedColumnError,
  z.infer<typeof zCompleteRefreshCachedColumnError>
>({ value: true });
