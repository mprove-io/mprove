import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendEditProviderResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendEditProvider}`;
    method: 'POST';
  }
>;

export let zToBackendEditProviderResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendEditProvider}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendEditProviderResponseInfo' });

assertTypesEqual<
  ToBackendEditProviderResponseInfo,
  z.infer<typeof zToBackendEditProviderResponseInfo>
>({ value: true });
