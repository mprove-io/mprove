import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';

export type ToBackendGetSkillsError = never;

export let zToBackendGetSkillsError = z.never();

assertTypesEqual<
  ToBackendGetSkillsError,
  z.infer<typeof zToBackendGetSkillsError>
>({ value: true });
