import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendDeleteLlmModelRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendDeleteLlmModel;
  }
>;

export let zToBackendDeleteLlmModelRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendDeleteLlmModel)
  })
  .meta({ id: 'ToBackendDeleteLlmModelRequestInfo' });

assertTypesEqual<
  ToBackendDeleteLlmModelRequestInfo,
  z.infer<typeof zToBackendDeleteLlmModelRequestInfo>
>({ value: true });
