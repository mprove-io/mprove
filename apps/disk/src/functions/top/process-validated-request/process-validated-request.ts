import type { Logger } from '@nestjs/common';
import { Result } from '@praha/byethrow';
import type { ToDiskOperation } from '#common/types/disk/request/to-disk-operation';
import type { ToDiskRequestForOperation } from '#common/types/disk/request/to-disk-request-for-operation';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';
import type { ToDiskResponseMetadata } from '#common/types/disk/response/to-disk-response-metadata';
import type { DiskResultForOperation } from '#disk/types/disk-result-for-operation';

export async function processValidatedRequest<
  TOperation extends ToDiskOperation
>(item: {
  operation: TOperation;
  request: ToDiskRequestForOperation<TOperation>;
  method: string;
  process: (
    input: ToDiskRequestForOperation<TOperation>['input']
  ) => Promise<DiskResultForOperation<TOperation>>;
  logger: Logger;
  startTs?: number;
}): Promise<ToDiskResponseForOperation<TOperation>> {
  let { operation, request, method, process, logger } = item;

  let startTs: number = item.startTs ?? Date.now();

  try {
    let result: DiskResultForOperation<TOperation> = await process(
      request.input
    );

    let metadata: ToDiskResponseMetadata<TOperation> = {
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId
    };

    let response: ToDiskResponseForOperation<TOperation> = (
      Result.isSuccess(result)
        ? { type: 'Success', ...metadata, output: result.value }
        : { type: 'Failure', ...metadata, error: result.error }
    ) as ToDiskResponseForOperation<TOperation>;

    return response;
  } catch (error) {
    logger.error(error);

    let response: ToDiskResponseForOperation<TOperation> = {
      type: 'Failure',
      operation: operation,
      method: method,
      duration: Date.now() - startTs,
      traceId: request.traceId,
      error: { code: 'DISK_INTERNAL' }
    } as ToDiskResponseForOperation<TOperation>;

    return response;
  }
}
