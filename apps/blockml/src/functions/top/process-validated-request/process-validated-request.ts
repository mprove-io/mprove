import type { Logger } from '@nestjs/common';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import type { ToBlockmlRequestForOperation } from '#common/zod/blockml/request/to-blockml-request-for-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';
import type { ToBlockmlResponseResultForOperation } from '#common/zod/blockml/response/to-blockml-response-result-for-operation';

export async function processValidatedRequest<
  TOperation extends ToBlockmlOperation
>(item: {
  operation: TOperation;
  request: ToBlockmlRequestForOperation<TOperation>;
  method: string;
  process: (
    input: ToBlockmlRequestForOperation<TOperation>['input']
  ) => Promise<ToBlockmlResponseResultForOperation<TOperation>>;
  logger: Logger;
  startTs?: number;
}): Promise<ToBlockmlResponseForOperation<TOperation>> {
  let { operation, request, method, process, logger } = item;

  let startTs: number = item.startTs ?? Date.now();

  try {
    let result: ToBlockmlResponseResultForOperation<TOperation> = await process(
      request.input
    );

    let response: ToBlockmlResponseForOperation<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: result
    };

    return response;
  } catch (error) {
    logger.error(error);

    let response: ToBlockmlResponseForOperation<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: { type: 'Failure', error: { code: 'BLOCKML_INTERNAL' } }
    };

    return response;
  }
}
