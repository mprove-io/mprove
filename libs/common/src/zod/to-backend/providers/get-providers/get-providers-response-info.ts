import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import { type ResponseInfo, zResponseInfo } from '#common/zod/to/response-info';

export type ToBackendGetProvidersResponseInfo = Extend<
  ResponseInfo,
  {
    path: `/${ToBackendRequestInfoNameEnum.ToBackendGetProviders}`;
    method: 'POST';
  }
>;

export let zToBackendGetProvidersResponseInfo = zResponseInfo
  .extend({
    path: z.literal(`/${ToBackendRequestInfoNameEnum.ToBackendGetProviders}`),
    method: z.literal('POST')
  })
  .meta({ id: 'ToBackendGetProvidersResponseInfo' });

assertTypesEqual<
  ToBackendGetProvidersResponseInfo,
  z.infer<typeof zToBackendGetProvidersResponseInfo>
>({ value: true });
