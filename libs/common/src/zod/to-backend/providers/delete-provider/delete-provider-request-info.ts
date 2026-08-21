import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendDeleteProviderRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendDeleteProvider;
  }
>;

export let zToBackendDeleteProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteProvider)
  })
  .meta({ id: 'ToBackendDeleteProviderRequestInfo' });

assertTypesEqual<
  ToBackendDeleteProviderRequestInfo,
  z.infer<typeof zToBackendDeleteProviderRequestInfo>
>({ value: true });
