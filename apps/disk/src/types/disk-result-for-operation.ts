import type { Result } from '@praha/byethrow';
import type { ToDiskOperation } from '#common/zod/disk/request/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/zod/disk/response/to-disk-response-for-operation';

export type DiskResultForOperation<TOperation extends ToDiskOperation> =
  Result.Result<
    Extract<
      ToDiskResponseForOperation<TOperation>,
      { type: 'Success' }
    >['output'],
    Extract<
      ToDiskResponseForOperation<TOperation>,
      { type: 'Failure' }
    >['error']
  >;
