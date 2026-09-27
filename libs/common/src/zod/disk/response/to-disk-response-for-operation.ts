import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/zod/disk/request/to-disk-operation-registry';

export type ToDiskResponseForOperation<TOperation extends ToDiskOperation> =
  ToDiskOperationRegistry[TOperation]['response'];
