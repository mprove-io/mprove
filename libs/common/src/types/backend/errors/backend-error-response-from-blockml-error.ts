import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
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
  originalError?: BlockmlInternalError | BlockmlInvalidRequestError;
};

export let zBackendErrorResponseFromBlockmlError = z.object({
  code: z.literal('BACKEND_ERROR_RESPONSE_FROM_BLOCKML'),
  originalError: z
    .discriminatedUnion('code', [
      zBlockmlInternalError,
      zBlockmlInvalidRequestError
    ])
    .nullish()
});

assertTypesEqual<
  BackendErrorResponseFromBlockmlError,
  z.infer<typeof zBackendErrorResponseFromBlockmlError>
>({ value: true });
