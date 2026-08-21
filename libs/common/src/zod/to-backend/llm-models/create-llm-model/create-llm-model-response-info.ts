import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendCreateLlmModelResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel}`;
    method: 'POST';
  }
>;

export let zToBackendCreateLlmModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateLlmModel}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateLlmModelResponseInfo' });

assertTypesEqual<
  ToBackendCreateLlmModelResponseInfo,
  z.infer<typeof zToBackendCreateLlmModelResponseInfo>
>({ value: true });
