import type { Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  getToDiskRequestSchema,
  type ToDiskOperationName,
  type ToDiskRequestFor,
  type ToDiskResultFor,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';
import { makeInvalidRequestResponse } from '#disk/functions/make-invalid-request-response';
import { processValidatedRequest } from '#disk/functions/process-validated-request';

export async function handleHttpRequest<
  TName extends ToDiskOperationName
>(item: {
  name: TName;
  body: unknown;
  method: string;
  process: (
    input: ToDiskRequestFor<TName>['input']
  ) => Promise<ToDiskResultFor<TName>>;
  logger: Logger;
}): Promise<ToDiskWireResponseFor<TName>> {
  let { name, body, method, process, logger } = item;

  let startTs: number = Date.now();

  let requestResult: z.ZodSafeParseResult<ToDiskRequestFor<TName>> =
    getToDiskRequestSchema({ name: name }).safeParse(body);

  if (requestResult.success === false) {
    let response: ToDiskWireResponseFor<TName> = makeInvalidRequestResponse({
      name: name,
      message: body,
      error: requestResult.error,
      startTs: startTs,
      method: method
    });

    return response;
  }

  let response: ToDiskWireResponseFor<TName> = await processValidatedRequest({
    name: name,
    request: requestResult.data,
    method: method,
    process: process,
    logger: logger,
    startTs: startTs
  });

  return response;
}
