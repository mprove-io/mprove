import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';
import type { ToDiskResponse } from '#common/zod/to-disk/to-disk-response';

type ToDiskSuccessForOperation<TOperation extends ToDiskOperation> = Extract<
  ToDiskOperationRegistry[TOperation]['response']['result'],
  { type: 'Success' }
>['value'];

type ToDiskErrorForOperation<TOperation extends ToDiskOperation> = Extract<
  ToDiskOperationRegistry[TOperation]['response']['result'],
  { type: 'Failure' }
>['error'];

export type ToDiskResponseForOperation<TOperation extends ToDiskOperation> =
  ToDiskResponse<
    TOperation,
    ToDiskSuccessForOperation<TOperation>,
    ToDiskErrorForOperation<TOperation>
  >;
