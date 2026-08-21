import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendRefreshLlmModelResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendRefreshLlmModel}`;
    method: 'POST';
  }
>;

export let zToBackendRefreshLlmModelResponseInfo = zResponseInfo
  .extend({
    path: z.literal(
      `/${ToBackendRequestInfoNameEnum.ToBackendRefreshLlmModel}`
    ),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendRefreshLlmModelResponseInfo' });

assertTypesEqual<
  ToBackendRefreshLlmModelResponseInfo,
  z.infer<typeof zToBackendRefreshLlmModelResponseInfo>
>({ value: true });
