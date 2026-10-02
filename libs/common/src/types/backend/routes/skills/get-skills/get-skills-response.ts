import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponseBase
} from '#common/types/backend/response/to-backend-response-base';
import {
  type ToBackendGetSkillsOutput,
  zToBackendGetSkillsOutput
} from '#common/types/backend/routes/skills/get-skills/get-skills-output';
import {
  type ToBackendGetSkillsError,
  zToBackendGetSkillsError
} from './get-skills-error';

export type ToBackendGetSkillsResponse = ToBackendResponseBase<
  'getSkills',
  ToBackendGetSkillsOutput,
  ToBackendGetSkillsError
>;

export let zToBackendGetSkillsResponse = makeToBackendResponseSchema({
  operation: 'getSkills',
  output: zToBackendGetSkillsOutput,
  error: zToBackendGetSkillsError
}).meta({ id: 'ToBackendGetSkillsResponse' });

assertTypesEqual<
  ToBackendGetSkillsResponse,
  z.infer<typeof zToBackendGetSkillsResponse>
>({ value: true });
