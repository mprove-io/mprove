import { randomUUID } from 'node:crypto';
import type { Logger } from '@nestjs/common';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/zod/to-disk/to-disk-request-for-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';

export async function processValidatedRequest<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
  request: ToDiskRequestForOperation<TOperation>;
  method: string;
  process: (
    input: ToDiskRequestForOperation<TOperation>['input']
  ) => Promise<ToDiskResultForOperation<TOperation>>;
  logger: Logger;
  startTs?: number;
}): Promise<ToDiskResponseForOperation<TOperation>> {
  let { operation, request, method, process, logger } = item;

  let startTs: number = item.startTs ?? Date.now();

  try {
    let result: ToDiskResultForOperation<TOperation> = await process(
      request.input
    );

    let response: ToDiskResponseForOperation<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: result
    };

    return response;
  } catch (error) {
    let incidentId: string = randomUUID();

    logger.error({ incidentId: incidentId, error: error });

    let response: ToDiskResponseForOperation<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: { type: 'InternalFailure', incidentId: incidentId }
    };

    return response;
  }
}
