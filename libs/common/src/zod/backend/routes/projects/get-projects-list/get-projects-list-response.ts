import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/zod/backend/response/to-backend-response-base';
import {
  type ToBackendGetProjectsListOutput,
  zToBackendGetProjectsListOutput
} from '#common/zod/backend/routes/projects/get-projects-list/get-projects-list-output';
import {
  type ToBackendGetProjectsListError,
  zToBackendGetProjectsListError
} from './get-projects-list-error';

export type ToBackendGetProjectsListResponse = ToBackendResponseBase<
  'getProjectsList',
  ToBackendGetProjectsListOutput,
  ToBackendGetProjectsListError
>;

export let zToBackendGetProjectsListResponse = makeToBackendResponseSchema({
  operation: 'getProjectsList',
  output: zToBackendGetProjectsListOutput,
  error: zToBackendGetProjectsListError
}).meta({ id: 'ToBackendGetProjectsListResponse' });

assertTypesEqual<
  ToBackendGetProjectsListResponse,
  z.infer<typeof zToBackendGetProjectsListResponse>
>({ value: true });
