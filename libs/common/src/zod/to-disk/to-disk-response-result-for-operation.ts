import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export type ToDiskResponseResultForOperation<
  TOperation extends ToDiskOperation
> = ToDiskResponseForOperation<TOperation>['result'];
