import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type BlockmlInvalidRequestError,
  zBlockmlInvalidRequestError
} from '#common/zod/blockml/errors/blockml-invalid-request-error';
import type { ToBlockmlFailure } from '#common/zod/blockml/response/to-blockml-failure';
import {
  type ToBlockmlResponseMetadata,
  zToBlockmlResponseMetadata
} from '#common/zod/blockml/response/to-blockml-response-metadata';

export type ToBlockmlUnknownOperationResponse = Extend<
  ToBlockmlResponseMetadata<string>,
  ToBlockmlFailure<BlockmlInvalidRequestError>
>;

export let zToBlockmlUnknownOperationResponse = z.object({
  type: z.literal('Failure'),
  ...zToBlockmlResponseMetadata.shape,
  error: zBlockmlInvalidRequestError
});

assertTypesEqual<
  ToBlockmlUnknownOperationResponse,
  z.infer<typeof zToBlockmlUnknownOperationResponse>
>({ value: true });
