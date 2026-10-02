import type { Logger } from '@nestjs/common';
import type { z } from 'zod';
import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import { zToDiskOperationRegistry } from '#common/types/disk/request/to-disk-operation-registry';
import type { ToDiskRequestForOperation } from '#common/types/disk/request/to-disk-request-for-operation';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';
import { makeInvalidRequestResponse } from '#disk/functions/top/make-invalid-request-response/make-invalid-request-response';
import { processValidatedRequest } from '#disk/functions/top/process-validated-request/process-validated-request';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

export async function handleHttpRequest<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
  body: unknown;
  method: string;
  process: (
    input: ToDiskRequestForOperation<TOperation>['input']
  ) => Promise<DiskResultForOperation<TOperation>>;
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
