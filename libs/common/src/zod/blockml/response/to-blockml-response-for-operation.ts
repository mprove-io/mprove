import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlOperationRegistry } from '#common/zod/blockml/request/to-blockml-operation-registry';
import type { ToBlockmlResponse } from '#common/zod/blockml/response/to-blockml-response';

export type ToBlockmlResponseForOperation<
  TOperation extends ToBlockmlOperation
> = ToBlockmlResponse<
  TOperation,
  ToBlockmlSuccessForOperation<TOperation>,
  ToBlockmlErrorForOperation<TOperation>
>;

type ToBlockmlSuccessForOperation<TOperation extends ToBlockmlOperation> =
  Extract<
    ToBlockmlOperationRegistry[TOperation]['response']['result'],
    { type: 'Success' }
  >['value'];

type ToBlockmlErrorForOperation<TOperation extends ToBlockmlOperation> =
  Extract<
    ToBlockmlOperationRegistry[TOperation]['response']['result'],
    { type: 'Failure' }
  >['error'];
