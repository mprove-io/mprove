import type { ToBlockmlOperation } from '#common/types/blockml/request/to-blockml-operation';
import type { ToBlockmlOperationRegistry } from '#common/types/blockml/request/to-blockml-operation-registry';

export type ToBlockmlRequestForOperation<
  TOperation extends ToBlockmlOperation
> = ToBlockmlOperationRegistry[TOperation]['request'];
