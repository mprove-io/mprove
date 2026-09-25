import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type BlockmlInvalidRequestError,
  zBlockmlInvalidRequestError
} from '#common/zod/blockml/errors/blockml-invalid-request-error';
import type { ToBlockmlResponse } from '#common/zod/blockml/response/to-blockml-response';

export type ToBlockmlInvalidRequestErrorResponse = Extend<
  ToBlockmlResponse<string, never, BlockmlInvalidRequestError>,
  { result: { type: 'Failure'; error: BlockmlInvalidRequestError } }
>;

export let zToBlockmlInvalidRequestErrorResponse = z.object({
  operation: z.string(),
  method: z.string(),
  duration: z.number().nonnegative(),
  traceId: z.string(),
  result: z.object({
    type: z.literal('Failure'),
    error: zBlockmlInvalidRequestError
  })
});

assertTypesEqual<
  ToBlockmlInvalidRequestErrorResponse,
  z.infer<typeof zToBlockmlInvalidRequestErrorResponse>
>({ value: true });
