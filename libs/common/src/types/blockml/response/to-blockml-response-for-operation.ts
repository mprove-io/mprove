import type { ToBlockmlOperation } from '#common/types/blockml/request/to-blockml-operation';
import type { ToBlockmlOperationRegistry } from '#common/types/blockml/request/to-blockml-operation-registry';

export type ToBlockmlResponseForOperation<
  TOperation extends ToBlockmlOperation
> = ToBlockmlOperationRegistry[TOperation]['response'];
