import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetOrgsListOutput,
  zToBackendGetOrgsListOutput
} from '#common/zod/backend/routes/orgs/get-orgs-list/get-orgs-list-output';
import {
  type ToBackendGetOrgsListError,
  zToBackendGetOrgsListError
} from './get-orgs-list-error';

export type ToBackendGetOrgsListResponse = ToBackendResponseBase<
  'getOrgsList',
  ToBackendGetOrgsListOutput,
  ToBackendGetOrgsListError
>;

export let zToBackendGetOrgsListResponse = makeToBackendResponseSchema({
  operation: 'getOrgsList',
  output: zToBackendGetOrgsListOutput,
  error: zToBackendGetOrgsListError
}).meta({ id: 'ToBackendGetOrgsListResponse' });

assertTypesEqual<
  ToBackendGetOrgsListResponse,
  z.infer<typeof zToBackendGetOrgsListResponse>
>({ value: true });
