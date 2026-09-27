import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  makeToBackendResponseSchema,
  type ToBackendResponse
} from '#common/zod/backend/response/to-backend-response';
import { type SkillItem, zSkillItem } from '#common/zod/backend/skill-item';
import {
  type ToBackendGetSkillsError,
  zToBackendGetSkillsError
} from './get-skills-error';

export type ToBackendGetSkillsOutput = {
  skillItems: SkillItem[];
};

export type ToBackendGetSkillsResponse = ToBackendResponse<
  ToBackendGetSkillsOutput,
  ToBackendGetSkillsError
>;

export let zToBackendGetSkillsOutput = z
  .object({
    skillItems: z.array(zSkillItem)
  })
  .meta({ id: 'ToBackendGetSkillsOutput' });

export let zToBackendGetSkillsResponse = makeToBackendResponseSchema({
  success: zToBackendGetSkillsOutput,
  error: zToBackendGetSkillsError
}).meta({ id: 'ToBackendGetSkillsResponse' });

assertTypesEqual<
  ToBackendGetSkillsOutput,
  z.infer<typeof zToBackendGetSkillsOutput>
>({ value: true });

assertTypesEqual<
  ToBackendGetSkillsResponse,
  z.infer<typeof zToBackendGetSkillsResponse>
>({ value: true });
