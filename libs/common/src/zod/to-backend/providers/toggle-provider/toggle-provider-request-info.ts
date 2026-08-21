import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendToggleProviderRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendToggleProvider;
  }
>;

export let zToBackendToggleProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendToggleProvider)
  })
  .meta({ id: 'ToBackendToggleProviderRequestInfo' });

assertTypesEqual<
  ToBackendToggleProviderRequestInfo,
  z.infer<typeof zToBackendToggleProviderRequestInfo>
>({ value: true });
