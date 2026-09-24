import { Injectable, Logger } from '@nestjs/common';
import type { z } from 'zod';
import { RebuildStructService } from '#blockml/controllers/rebuild-struct/rebuild-struct.service';
import { makeInvalidRequestResponse } from '#blockml/functions/make-invalid-request-response/make-invalid-request-response';
import { processValidatedRequest } from '#blockml/functions/process-validated-request/process-validated-request';
import { METHOD_RPC } from '#common/constants/top';
import {
  type ToBlockmlOperation,
  zToBlockmlOperation
} from '#common/zod/blockml/request/to-blockml-operation';
import { zToBlockmlOperationRegistry } from '#common/zod/blockml/request/to-blockml-operation-registry';
import type { ToBlockmlRequest } from '#common/zod/blockml/request/to-blockml-request';
import type { ToBlockmlInvalidRequestErrorResponse } from '#common/zod/blockml/response/to-blockml-invalid-request-error-response';
import type { ToBlockmlOperationResponse } from '#common/zod/blockml/response/to-blockml-operation-response';
import type { ToBlockmlResponseForOperation } from '#common/zod/blockml/response/to-blockml-response-for-operation';

@Injectable()
export class MessageService {
  constructor(
    private rebuildStructService: RebuildStructService,
    private logger: Logger
  ) {}

  async processRequest(item: {
    request: ToBlockmlRequest;
  }): Promise<ToBlockmlOperationResponse> {
    let { request } = item;

    let response: ToBlockmlOperationResponse = await this.dispatch({
      request: request
    });

    return response;
  }

  async handleMessage(item: {
    message: unknown;
  }): Promise<
    ToBlockmlOperationResponse | ToBlockmlInvalidRequestErrorResponse
  > {
    let { message } = item;

    let startTs: number = Date.now();

    let operationValue: unknown =
      typeof message === 'object' && message !== null && 'operation' in message
        ? message.operation
        : undefined;

    let operationResult: z.ZodSafeParseResult<ToBlockmlOperation> =
      zToBlockmlOperation.safeParse(operationValue);

    if (operationResult.success === false) {
      let traceIdValue: unknown =
        typeof message === 'object' && message !== null && 'traceId' in message
          ? message.traceId
          : undefined;

      let response: ToBlockmlInvalidRequestErrorResponse = {
        operation: typeof operationValue === 'string' ? operationValue : '',
        method: METHOD_RPC,
        duration: Date.now() - startTs,
        traceId: typeof traceIdValue === 'string' ? traceIdValue : '',
        result: {
          type: 'Failure',
          error: {
            code: 'BLOCKML_INVALID_REQUEST',
            displayData: [
              {
                path: 'operation',
                message: 'Missing or unknown blockml request discriminator',
                code: 'invalid_value'
              }
            ]
          }
        }
      };

      return response;
    }

    let operation: ToBlockmlOperation = operationResult.data;

    let requestResult: z.ZodSafeParseResult<ToBlockmlRequest> =
      zToBlockmlOperationRegistry[operation].request.safeParse(message);

    if (requestResult.success === false) {
      let response: ToBlockmlOperationResponse = makeInvalidRequestResponse({
        operation: operation,
        message: message,
        error: requestResult.error,
        startTs: startTs,
        method: METHOD_RPC
      });

      return response;
    }

    let response: ToBlockmlOperationResponse = await this.dispatch({
      request: requestResult.data
    });

    return response;
  }

  private async dispatch(item: {
    request: ToBlockmlRequest;
  }): Promise<ToBlockmlOperationResponse> {
    let { request } = item;

    let response: ToBlockmlResponseForOperation<'rebuildStruct'> =
      await processValidatedRequest({
        operation: request.operation,
        request: request,
        method: METHOD_RPC,
        process: input => this.rebuildStructService.process(input),
        logger: this.logger
      });

    return response;
  }
}
