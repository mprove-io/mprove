import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';

export type DbProjectsFindFirstError = ProjectEntToTabError;

export let zDbProjectsFindFirstError = zProjectEntToTabError;

assertTypesEqual<
  DbProjectsFindFirstError,
  z.infer<typeof zDbProjectsFindFirstError>
>({
  value: true
});
