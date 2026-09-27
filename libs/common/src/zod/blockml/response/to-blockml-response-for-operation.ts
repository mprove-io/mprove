import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlOperationRegistry } from '#common/zod/blockml/request/to-blockml-operation-registry';

export type ToBlockmlResponseForOperation<
  TOperation extends ToBlockmlOperation
> = ToBlockmlOperationRegistry[TOperation]['response'];
