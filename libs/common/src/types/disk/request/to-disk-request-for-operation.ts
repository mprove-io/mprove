import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/types/disk/request/to-disk-operation-registry';

export type ToDiskRequestForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationRegistry[TOperation]['request'];
