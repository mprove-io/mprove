import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/types/disk/request/to-disk-operation-registry';

export type ToDiskResponseForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationRegistry[TOperation]['response'];
