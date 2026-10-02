import type { ToDiskRequest } from '#common/types/disk/request/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/types/disk/response/to-disk-response-for-operation';

export type ToDiskResponseForRequest<TRequest extends ToDiskRequest> =
  ToDiskResponseForOperation<TRequest['operation']>;
