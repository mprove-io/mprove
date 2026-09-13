import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/zod/disk/request/to-disk-operation-registry';

export type ToDiskRequestForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationRegistry[TOperation]['request'];
