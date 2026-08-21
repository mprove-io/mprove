import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendEditLlmModelResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendEditLlmModel}`;
    method: 'POST';
  }
>;

export let zToBackendEditLlmModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditLlmModel}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditLlmModelResponseInfo' });

assertTypesEqual<
  ToBackendEditLlmModelResponseInfo,
  z.infer<typeof zToBackendEditLlmModelResponseInfo>
>({ value: true });
