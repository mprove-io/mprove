import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export type ToDiskResultForOperation<TOperation extends ToDiskOperation> =
  Extract<
    ToDiskResponseForOperation<TOperation>['result'],
    { type: 'Success' | 'Failure' }
  >;
