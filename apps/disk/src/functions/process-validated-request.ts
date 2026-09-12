import { randomUUID } from 'node:crypto';
import type { Logger } from '@nestjs/common';
import {
  type ToDiskOperationName,
  type ToDiskRequestFor,
  type ToDiskResultFor,
  type ToDiskWireResponseFor
} from '#common/zod/to-disk/to-disk-operation-contract';

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

  try {
    let result: ToDiskResultFor<TName> = await process(request.input);

    let response: ToDiskWireResponseFor<TName> = {
      path: name,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: result
    };

    return response;
  } catch (error) {
    let incidentId: string = randomUUID();

    logger.error({ incidentId: incidentId, error: error });

    let response: ToDiskWireResponseFor<TName> = {
      path: name,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      result: { type: 'InternalFailure', incidentId: incidentId }
    };

    return response;
  }
}
