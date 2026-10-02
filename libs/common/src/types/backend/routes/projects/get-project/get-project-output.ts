import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import { type Member, zMember } from '#common/types/backend/parts/member';
import { type Project, zProject } from '#common/types/backend/parts/project';

export type ToBackendGetProjectOutput = {
  project: Project;
  userMember: Member;
};

export let zToBackendGetProjectOutput = z
  .object({
    project: zProject,
    userMember: zMember
  })
  .meta({ id: 'ToBackendGetProjectOutput' });

assertTypesEqual<
  ToBackendGetProjectOutput,
  z.infer<typeof zToBackendGetProjectOutput>
>({ value: true });
