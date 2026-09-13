import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';

export type ToBlockmlResponseResultForOperation<
  TOperation extends ToBlockmlOperation
> = ToBlockmlResponseForOperation<TOperation>['result'];
