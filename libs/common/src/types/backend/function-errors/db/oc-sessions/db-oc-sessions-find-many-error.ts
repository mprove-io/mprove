import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcSessionEntToTabError,
  zOcSessionEntToTabError
} from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';

export type DbOcSessionsFindManyError = OcSessionEntToTabError;

export let zDbOcSessionsFindManyError = zOcSessionEntToTabError;

assertTypesEqual<
  DbOcSessionsFindManyError,
  z.infer<typeof zDbOcSessionsFindManyError>
>({
  value: true
});
