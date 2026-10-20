import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OrgEntToTabError,
  zOrgEntToTabError
} from '#common/types/backend/function-errors/org-ent-to-tab-error';

export type DbOrgsFindFirstError = OrgEntToTabError;

export let zDbOrgsFindFirstError = zOrgEntToTabError;

assertTypesEqual<DbOrgsFindFirstError, z.infer<typeof zDbOrgsFindFirstError>>({
  value: true
});
