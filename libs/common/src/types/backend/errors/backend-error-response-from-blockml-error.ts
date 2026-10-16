import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MalloyToQueryFailedError,
  zMalloyToQueryFailedError
} from '#common/types/backend/errors/malloy-to-query-failed-error';
import {
  type BlockmlInternalError,
  zBlockmlInternalError
} from '#common/types/blockml/errors/blockml-internal-error';
import {
  type BlockmlInvalidRequestError,
  zBlockmlInvalidRequestError
} from '#common/types/blockml/errors/blockml-invalid-request-error';

export type BackendErrorResponseFromBlockmlError = {
  code: 'BACKEND_ERROR_RESPONSE_FROM_BLOCKML';
  originalError?:
    | BlockmlInternalError
    | BlockmlInvalidRequestError
    | MalloyToQueryFailedError;
};

export let zBackendErrorResponseFromBlockmlError = z.object({
  code: z.literal('BACKEND_ERROR_RESPONSE_FROM_BLOCKML'),
  originalError: z
    .discriminatedUnion('code', [
      zBlockmlInternalError,
      zBlockmlInvalidRequestError,
      zMalloyToQueryFailedError
    ])
    .nullish()
});

assertTypesEqual<
  BackendErrorResponseFromBlockmlError,
  z.infer<typeof zBackendErrorResponseFromBlockmlError>
>({ value: true });
