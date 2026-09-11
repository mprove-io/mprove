import { randomUUID } from 'node:crypto';
import type { Logger } from '@nestjs/common';
import { z } from 'zod';
import {
  getToDiskPilotRequestSchema,
  getToDiskPilotWireResponseSchema,
  type ToDiskPilotOperationName,
  type ToDiskPilotRequestFor,
  type ToDiskPilotWireResponseFor,
  type ToDiskResultFor
} from '#common/zod/to-disk/to-disk-operation-contract';
import type { ToDiskPilotResponseInfo } from '#common/zod/to-disk/to-disk-pilot-response-info';

export async function processPilotResponse<
  TName extends ToDiskPilotOperationName
>(item: {
  name: TName;
  body: unknown;
  method: string;
  process: (
    input: ToDiskPilotRequestFor<TName>['input']
  ) => Promise<ToDiskResultFor<TName>>;
  logger: Logger;
}): Promise<ToDiskPilotWireResponseFor<TName>> {
  let startTs: number = Date.now();

  let metadata: z.ZodSafeParseResult<{ traceId: string }> = z
    .object({
      traceId: z.string()
    })
    .safeParse(item.body);

  let info: ToDiskPilotResponseInfo = {
    path: item.name,
    method: item.method,
    duration: 0,
    traceId: metadata.success ? metadata.data.traceId : ''
  };

  let schema: z.ZodType<ToDiskPilotWireResponseFor<TName>> =
    getToDiskPilotWireResponseSchema({ name: item.name });

  try {
    let request: z.ZodSafeParseResult<ToDiskPilotRequestFor<TName>> =
      getToDiskPilotRequestSchema({ name: item.name }).safeParse(item.body);

    if (!request.success) {
      info.duration = Date.now() - startTs;

      let response: ToDiskPilotWireResponseFor<TName> = schema.parse({
        info: info,
        result: {
          type: 'InvalidRequest',
          issues: request.error.issues.map(issue => ({
            path: issue.path.join('.'),
            message: issue.message,
            code: issue.code
          }))
        }
      });

      return response;
    }

    let result: ToDiskResultFor<TName> = await item.process(request.data.input);

    info.duration = Date.now() - startTs;

    let response: ToDiskPilotWireResponseFor<TName> = schema.parse({
      info: info,
      result: result
    });

    return response;
  } catch (error) {
    let incidentId: string = randomUUID();

    item.logger.error({ incidentId: incidentId, error: error });

    info.duration = Date.now() - startTs;

    let response: ToDiskPilotWireResponseFor<TName> = schema.parse({
      info: info,
      result: { type: 'InternalFailure', incidentId: incidentId }
    });

    return response;
  }
}
