import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendDeleteOrgOutput,
  zToBackendDeleteOrgOutput
} from '#common/zod/backend/routes/orgs/delete-org/delete-org-output';
import {
  type ToBackendDeleteOrgError,
  zToBackendDeleteOrgError
} from './delete-org-error';

export type ToBackendDeleteOrgResponse = ToBackendResponseBase<
  'deleteOrg',
  ToBackendDeleteOrgOutput,
  ToBackendDeleteOrgError
>;

export let zToBackendDeleteOrgResponse = makeToBackendResponseSchema({
  operation: 'deleteOrg',
  output: zToBackendDeleteOrgOutput,
  error: zToBackendDeleteOrgError
}).meta({ id: 'ToBackendDeleteOrgResponse' });

assertTypesEqual<
  ToBackendDeleteOrgResponse,
  z.infer<typeof zToBackendDeleteOrgResponse>
>({ value: true });
