import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendEditLlmModelRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendEditLlmModel;
  }
>;

export let zToBackendEditLlmModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendEditLlmModel)
  })
  .meta({ id: 'ToBackendEditLlmModelRequestInfo' });

assertTypesEqual<
  ToBackendEditLlmModelRequestInfo,
  z.infer<typeof zToBackendEditLlmModelRequestInfo>
>({ value: true });
