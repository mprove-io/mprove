import type { Result } from '@praha/byethrow';
import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';

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
