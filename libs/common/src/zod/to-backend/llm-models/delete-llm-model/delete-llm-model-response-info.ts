import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendDeleteLlmModelResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendDeleteLlmModel}`;
    method: 'POST';
  }
>;

export let zToBackendDeleteLlmModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteLlmModel}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteLlmModelResponseInfo' });

assertTypesEqual<
  ToBackendDeleteLlmModelResponseInfo,
  z.infer<typeof zToBackendDeleteLlmModelResponseInfo>
>({ value: true });
