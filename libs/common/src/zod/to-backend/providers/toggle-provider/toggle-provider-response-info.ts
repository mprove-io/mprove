import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendToggleProviderResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendToggleProvider}`;
    method: 'POST';
  }
>;

export let zToBackendToggleProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendToggleProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendToggleProviderResponseInfo' });

assertTypesEqual<
  ToBackendToggleProviderResponseInfo,
  z.infer<typeof zToBackendToggleProviderResponseInfo>
>({ value: true });
