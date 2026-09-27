import type { Logger } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { BlockmlResultForOperation } from '#blockml/types/blockml-result-for-operation';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlRequestForOperation } from '#common/zod/blockml/request/to-blockml-request-for-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';
import type { ToBlockmlResponseMetadata } from '#common/zod/blockml/response/to-blockml-response-metadata';

export async function processValidatedRequest<
  TOperation extends ToBlockmlOperation
>(item: {
  operation: TOperation;
  request: ToBlockmlRequestForOperation<TOperation>;
  method: string;
  process: (
    input: ToBlockmlRequestForOperation<TOperation>['input']
  ) => Promise<BlockmlResultForOperation<TOperation>>;
  logger: Logger;
  startTs?: number;
}): Promise<ToBlockmlResponseForOperation<TOperation>> {
  let { operation, request, method, process, logger } = item;

  let startTs: number = item.startTs ?? Date.now();

  try {
    let result: BlockmlResultForOperation<TOperation> = await process(
      request.input
    );

    let metadata: ToBlockmlResponseMetadata<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId
    };

    let response: ToBlockmlResponseForOperation<TOperation> = Result.isSuccess(
      result
    )
      ? { type: 'Success', ...metadata, output: result.value }
      : { type: 'Failure', ...metadata, error: result.error };

    return response;
  } catch (error) {
    logger.error(error);

    let response: ToBlockmlResponseForOperation<TOperation> = {
      type: 'Failure',
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      error: { code: 'BLOCKML_INTERNAL' }
    };

    return response;
  }
}
