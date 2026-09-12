import type { Logger } from '@nestjs/common';
import { z } from 'zod';
import type { ToDiskOperation } from '#common/zod/to-disk/to-disk-operation';
import { zToDiskOperationRegistry } from '#common/zod/to-disk/to-disk-operation-registry';
import type { ToDiskRequestForOperation } from '#common/zod/to-disk/to-disk-request-for-operation';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';
import type { ToDiskResultForOperation } from '#common/zod/to-disk/to-disk-result-for-operation';
import { makeInvalidRequestResponse } from '#disk/functions/make-invalid-request-response';
import { processValidatedRequest } from '#disk/functions/process-validated-request';

export async function handleHttpRequest<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
  body: unknown;
  method: string;
  process: (
    input: ToDiskRequestForOperation<TOperation>['input']
  ) => Promise<ToDiskResultForOperation<TOperation>>;
  logger: Logger;
}): Promise<ToDiskResponseForOperation<TOperation>> {
  let { operation, body, method, process, logger } = item;

  let startTs: number = Date.now();

  let requestResult: z.ZodSafeParseResult<
    ToDiskRequestForOperation<TOperation>
  > = zToDiskOperationRegistry[operation].request.safeParse(body);

  if (requestResult.success === false) {
    let response: ToDiskResponseForOperation<TOperation> =
      makeInvalidRequestResponse({
        operation: operation,
        message: body,
        error: requestResult.error,
        startTs: startTs,
        method: method
      });

    return response;
  }

  let response: ToDiskResponseForOperation<TOperation> =
    await processValidatedRequest({
      operation: operation,
      request: requestResult.data,
      method: method,
      process: process,
      logger: logger,
      startTs: startTs
    });

  return response;
}
