import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendEditProviderRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendEditProvider;
  }
>;

export let zToBackendEditProviderRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditProvider)
  })
  .meta({ id: 'ToBackendEditProviderRequestInfo' });

assertTypesEqual<
  ToBackendEditProviderRequestInfo,
  z.infer<typeof zToBackendEditProviderRequestInfo>
>({ value: true });
