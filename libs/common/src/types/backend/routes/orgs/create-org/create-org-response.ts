import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendCreateOrgOutput,
  zToBackendCreateOrgOutput
} from '#common/types/backend/routes/orgs/create-org/create-org-output';
import {
  type ToBackendCreateOrgError,
  zToBackendCreateOrgError
} from './create-org-error';

export type ToBackendCreateOrgResponse = ToBackendResponseBase<
  'createOrg',
  ToBackendCreateOrgOutput,
  ToBackendCreateOrgError
>;

export let zToBackendCreateOrgResponse = makeToBackendResponseSchema({
  operation: 'createOrg',
  output: zToBackendCreateOrgOutput,
  error: zToBackendCreateOrgError
}).meta({ id: 'ToBackendCreateOrgResponse' });

assertTypesEqual<
  ToBackendCreateOrgResponse,
  z.infer<typeof zToBackendCreateOrgResponse>
>({ value: true });
