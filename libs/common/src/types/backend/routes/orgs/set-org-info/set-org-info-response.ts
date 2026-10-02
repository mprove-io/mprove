import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendSetOrgInfoOutput,
  zToBackendSetOrgInfoOutput
} from '#common/types/backend/routes/orgs/set-org-info/set-org-info-output';
import {
  type ToBackendSetOrgInfoError,
  zToBackendSetOrgInfoError
} from './set-org-info-error';

export type ToBackendSetOrgInfoResponse = ToBackendResponseBase<
  'setOrgInfo',
  ToBackendSetOrgInfoOutput,
  ToBackendSetOrgInfoError
>;

export let zToBackendSetOrgInfoResponse = makeToBackendResponseSchema({
  operation: 'setOrgInfo',
  output: zToBackendSetOrgInfoOutput,
  error: zToBackendSetOrgInfoError
}).meta({ id: 'ToBackendSetOrgInfoResponse' });

assertTypesEqual<
  ToBackendSetOrgInfoResponse,
  z.infer<typeof zToBackendSetOrgInfoResponse>
>({ value: true });
