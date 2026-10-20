import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';

export type DbProjectsFindManyError = ProjectEntToTabError;

export let zDbProjectsFindManyError = zProjectEntToTabError;

assertTypesEqual<
  DbProjectsFindManyError,
  z.infer<typeof zDbProjectsFindManyError>
>({
  value: true
});
