import type { Result } from '@praha/byethrow';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';

export type BlockmlResultForOperation<TOperation extends ToBlockmlOperation> =
  Result.Result<
    Extract<
      ToBlockmlResponseForOperation<TOperation>,
      { type: 'Success' }
    >['output'],
    Extract<
      ToBlockmlResponseForOperation<TOperation>,
      { type: 'Failure' }
    >['error']
  >;
