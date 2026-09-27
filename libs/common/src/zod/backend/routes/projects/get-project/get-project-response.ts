import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/zod/backend/member';
import { type Project, zProject } from '#common/zod/backend/project';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import {
  type ToBackendGetProjectError,
  zToBackendGetProjectError
} from './get-project-error';

export type ToBackendGetProjectOutput = {
  project: Project;
  userMember: Member;
};

export type ToBackendGetProjectResponse = ToBackendResponse<
  ToBackendGetProjectOutput,
  ToBackendGetProjectError
>;

export let zToBackendGetProjectOutput = z
  .object({
    project: zProject,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetProjectOutput' });

export let zToBackendGetProjectResponse = makeToBackendResponseSchema({
  success: zToBackendGetProjectOutput,
  error: zToBackendGetProjectError
}).meta({ id: 'ToBackendGetProjectResponse' });

assertTypesEqual<
  ToBackendGetProjectOutput,
  z.infer<typeof zToBackendGetProjectOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetProjectResponse,
  z.infer<typeof zToBackendGetProjectResponse>
>({ value: true });
