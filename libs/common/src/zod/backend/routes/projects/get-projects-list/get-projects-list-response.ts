import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectsItem,
  zProjectsItem
} from '#common/zod/backend/projects-item';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetProjectsListError,
  zToBackendGetProjectsListError
} from './get-projects-list-error';

export type ToBackendGetProjectsListOutput = {
  projectsList: ProjectsItem[];
};

export type ToBackendGetProjectsListResponse = ToBackendResponse<
  ToBackendGetProjectsListOutput,
  ToBackendGetProjectsListError
>;

export let zToBackendGetProjectsListOutput = z
  .object({
    projectsList: z.array(zProjectsItem)
  })
  .meta({ id: 'ToBackendGetProjectsListOutput' });

export let zToBackendGetProjectsListResponse = makeToBackendResponseSchema({
  success: zToBackendGetProjectsListOutput,
  error: zToBackendGetProjectsListError
}).meta({ id: 'ToBackendGetProjectsListResponse' });

assertTypesEqual<
  ToBackendGetProjectsListOutput,
  z.infer<typeof zToBackendGetProjectsListOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProjectsListResponse,
  z.infer<typeof zToBackendGetProjectsListResponse>
>({ value: true });
