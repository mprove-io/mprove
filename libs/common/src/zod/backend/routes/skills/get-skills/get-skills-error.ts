import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendError,
  zBackendError
} from '#common/zod/backend/errors/backend-error';

export type ToBackendGetSkillsError = BackendError;

export let zToBackendGetSkillsError = zBackendError;

assertTypesEqual<
  ToBackendGetSkillsError,
  z.infer<typeof zToBackendGetSkillsError>
>({ value: true });
