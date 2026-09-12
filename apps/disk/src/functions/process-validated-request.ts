import { randomUUID } from 'node:crypto';
import type { Logger } from '@nestjs/common';
import {
  type ToDiskOperationName,
  type ToDiskRequestFor,
  type ToDiskResultFor,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';
import type { ToDiskResponseInfo } from '#common/zod/to-disk/to-disk-response-info';

export async function processValidatedRequest<
  TName extends ToDiskOperationName
>(item: {
  name: TName;
  request: ToDiskRequestFor<TName>;
  method: string;
  process: (
    input: ToDiskRequestFor<TName>['input']
  ) => Promise<ToDiskResultFor<TName>>;
  logger: Logger;
  startTs?: number;
}): Promise<ToDiskWireResponseFor<TName>> {
  let { name, request, method, process, logger } = item;

  let startTs: number = item.startTs ?? Date.now();

  let responseInfo: ToDiskResponseInfo = {
    path: name,
    method: method,
    duration: 0,
    traceId: request.traceId
  };

  try {
    let result: ToDiskResultFor<TName> = await process(request.input);

    responseInfo.duration = Date.now() - startTs;

    let response: ToDiskWireResponseFor<TName> = {
      path: name,
      method: responseInfo.method,
      duration: responseInfo.duration,
      traceId: responseInfo.traceId,
      result: result
    };

    return response;
  } catch (error) {
    let incidentId: string = randomUUID();

    logger.error({ incidentId: incidentId, error: error });

    responseInfo.duration = Date.now() - startTs;

    let response: ToDiskWireResponseFor<TName> = {
      path: name,
      method: responseInfo.method,
      duration: responseInfo.duration,
      traceId: responseInfo.traceId,
      result: { type: 'InternalFailure', incidentId: incidentId }
    };

    return response;
  }
}
