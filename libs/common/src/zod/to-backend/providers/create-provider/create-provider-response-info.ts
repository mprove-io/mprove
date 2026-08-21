import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendCreateProviderResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendCreateProvider}`;
    method: 'POST';
  }
>;

export let zToBackendCreateProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendCreateProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendCreateProviderResponseInfo' });

assertTypesEqual<
  ToBackendCreateProviderResponseInfo,
  z.infer<typeof zToBackendCreateProviderResponseInfo>
>({ value: true });
