import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendDeleteProviderResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendDeleteProvider}`;
    method: 'POST';
  }
>;

export let zToBackendDeleteProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendDeleteProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendDeleteProviderResponseInfo' });

assertTypesEqual<
  ToBackendDeleteProviderResponseInfo,
  z.infer<typeof zToBackendDeleteProviderResponseInfo>
>({ value: true });
