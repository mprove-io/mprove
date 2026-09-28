import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendSetOrgOwnerOutput,
  zToBackendSetOrgOwnerOutput
} from '#common/zod/backend/routes/orgs/set-org-owner/set-org-owner-output';
import {
  type ToBackendSetOrgOwnerError,
  zToBackendSetOrgOwnerError
} from './set-org-owner-error';

export type ToBackendSetOrgOwnerResponse = ToBackendResponseBase<
  'setOrgOwner',
  ToBackendSetOrgOwnerOutput,
  ToBackendSetOrgOwnerError
>;

export let zToBackendSetOrgOwnerResponse = makeToBackendResponseSchema({
  operation: 'setOrgOwner',
  output: zToBackendSetOrgOwnerOutput,
  error: zToBackendSetOrgOwnerError
}).meta({ id: 'ToBackendSetOrgOwnerResponse' });

assertTypesEqual<
  ToBackendSetOrgOwnerResponse,
  z.infer<typeof zToBackendSetOrgOwnerResponse>
>({ value: true });
