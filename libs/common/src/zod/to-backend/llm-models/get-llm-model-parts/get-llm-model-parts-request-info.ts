import { z } from 'zod';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { assertTypesEqual } from '#common/functions/assert-types-equal';
import type { Extend } from '#common/types/extend';
import {
  type ToBackendRequestInfo,
  zToBackendRequestInfo
} from '#common/zod/to-backend/to-backend-request-info';

export type ToBackendGetLlmModelPartsRequestInfo = Extend<
  ToBackendRequestInfo,
  {
    name: ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts;
  }
>;

export let zToBackendGetLlmModelPartsRequestInfo = zToBackendRequestInfo
  .extend({
    name: z.literal(ToBackendRequestInfoNameEnum.ToBackendGetLlmModelParts)
  })
  .meta({ id: 'ToBackendGetLlmModelPartsRequestInfo' });

assertTypesEqual<
  ToBackendGetLlmModelPartsRequestInfo,
  z.infer<typeof zToBackendGetLlmModelPartsRequestInfo>
>({ value: true });
