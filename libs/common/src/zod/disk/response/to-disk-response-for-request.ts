import type { ToDiskRequest } from '#common/zod/disk/request/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/zod/disk/response/to-disk-response-for-operation';

export type ToDiskResponseForRequest<TRequest extends ToDiskRequest> =
  ToDiskResponseForOperation<TRequest['operation']>;
