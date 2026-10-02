import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetOrgOutput,
  zToBackendGetOrgOutput
} from '#common/types/backend/routes/orgs/get-org/get-org-output';
import {
  type ToBackendGetOrgError,
  zToBackendGetOrgError
} from './get-org-error';

export type ToBackendGetOrgResponse = ToBackendResponseBase<
  'getOrg',
  ToBackendGetOrgOutput,
  ToBackendGetOrgError
>;

export let zToBackendGetOrgResponse = makeToBackendResponseSchema({
  operation: 'getOrg',
  output: zToBackendGetOrgOutput,
  error: zToBackendGetOrgError
}).meta({ id: 'ToBackendGetOrgResponse' });

assertTypesEqual<
  ToBackendGetOrgResponse,
  z.infer<typeof zToBackendGetOrgResponse>
>({ value: true });
