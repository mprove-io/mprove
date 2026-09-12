import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskOperationContract } from '#common/zod/to-disk/to-disk-operation-contract';

export type ToDiskRequestForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationContract[TOperation]['request'];
