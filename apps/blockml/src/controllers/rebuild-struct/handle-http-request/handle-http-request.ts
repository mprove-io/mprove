import type { Logger } from '@nestjs/common';
import { z } from 'zod';
import { makeInvalidRequestResponse } from '#blockml/functions/make-invalid-request-response/make-invalid-request-response';
import { processValidatedRequest } from '#blockml/functions/process-validated-request/process-validated-request';
import type { ToBlockmlOperation } from '#common/zod/blockml/request/to-blockml-operation';
import { zToBlockmlOperationRegistry } from '#common/zod/blockml/request/to-blockml-operation-registry';
import type { ToBlockmlRequestForOperation } from '#common/zod/blockml/request/to-blockml-request-for-operation';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';
import type { ToBlockmlResponseResultForOperation } from '#common/zod/blockml/response/to-blockml-response-result-for-operation';

export async function handleHttpRequest<
  TOperation extends ToBlockmlOperation
>(item: {
  operation: TOperation;
  body: unknown;
  method: string;
  process: (
    input: ToBlockmlRequestForOperation<TOperation>['input']
  ) => Promise<ToBlockmlResponseResultForOperation<TOperation>>;
  logger: Logger;
}): Promise<ToBlockmlResponseForOperation<TOperation>> {
  let { operation, body, method, process, logger } = item;

  let startTs: number = Date.now();

  let requestResult: z.ZodSafeParseResult<
    ToBlockmlRequestForOperation<TOperation>
  > = zToBlockmlOperationRegistry[operation].request.safeParse(body);

  if (requestResult.success === false) {
    let response: ToBlockmlResponseForOperation<TOperation> =
      makeInvalidRequestResponse({
        operation: operation,
        message: body,
        error: requestResult.error,
        startTs: startTs,
        method: method
      });

    return response;
  }

  let response: ToBlockmlResponseForOperation<TOperation> =
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
