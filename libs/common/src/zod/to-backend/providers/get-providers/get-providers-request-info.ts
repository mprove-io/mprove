import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendGetProvidersRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendGetProviders;
  }
>;

export let zToBackendGetProvidersRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetProviders)
  })
  .meta({ id: 'ToBackendGetProvidersRequestInfo' });

assertTypesEqual<
  ToBackendGetProvidersRequestInfo,
  z.infer<typeof zToBackendGetProvidersRequestInfo>
>({ value: true });
