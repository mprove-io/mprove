import type { ToDiskRequest } from '#common/zod/to-disk/to-disk-request';
import type { ToDiskResponseForOperation } from '#common/zod/to-disk/to-disk-response-for-operation';

export type ToDiskResponseForRequest<TRequest extends ToDiskRequest> =
  ToDiskResponseForOperation<TRequest['operation']>;
