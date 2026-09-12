import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';

export type ToDiskRequestForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationRegistry[TOperation]['request'];
