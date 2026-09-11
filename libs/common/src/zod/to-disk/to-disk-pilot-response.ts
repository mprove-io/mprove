import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToDiskInternalFailure,
  zToDiskInternalFailure
} from './to-disk-internal-failure';
import {
  type ToDiskInvalidRequest,
  zToDiskInvalidRequest
} from './to-disk-invalid-request';
import {
  type ToDiskPilotResponseInfo,
  zToDiskPilotResponseInfo
} from './to-disk-pilot-response-info';

export type ToDiskPilotResponse<TPath extends string, TSuccess, TError> = {
  info: Extend<ToDiskPilotResponseInfo, { path: TPath }>;
  result:
    | { type: 'Success'; value: TSuccess }
    | { type: 'Failure'; error: TError }
    | ToDiskInternalFailure
    | ToDiskInvalidRequest;
};

export type ToDiskPilotDomainResponse<TResponse extends { result: unknown }> = {
  [TKey in keyof TResponse]: TKey extends 'result'
    ? Extract<TResponse[TKey], { type: 'Success' | 'Failure' }>
    : TResponse[TKey];
};

export type ToDiskPilotSuccessResponse<TResponse extends { result: unknown }> =
  {
    [TKey in keyof TResponse]: TKey extends 'result'
      ? Extract<TResponse[TKey], { type: 'Success' }>
      : TResponse[TKey];
  };

export function makeToDiskPilotResponseSchema<
  TPath extends string,
  TSuccess,
  TError
>(item: {
  path: TPath;
  success: z.ZodType<TSuccess>;
  error: z.ZodType<TError>;
}) {
  let { path, success, error } = item;

  let schema = z
    .object({
      info: zToDiskPilotResponseInfo.extend({ path: z.literal(path) }),
      result: z.discriminatedUnion('type', [
        // Project generic fields explicitly with strictNullChecks disabled.
        z
          .object({ type: z.literal('Success'), value: success })
          .transform(item => ({ type: item.type, value: item.value })),
        z
          .object({ type: z.literal('Failure'), error: error })
          .transform(item => ({ type: item.type, error: item.error })),
        zToDiskInternalFailure,
        zToDiskInvalidRequest
      ])
    })
    .transform(item => ({ info: item.info, result: item.result }));

  assertTypesEqual<
    ToDiskPilotResponse<TPath, TSuccess, TError>,
    z.infer<typeof schema>
  >({ value: true });

  return schema;
}
