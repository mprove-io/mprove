import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcSessionEntToTabError,
  zOcSessionEntToTabError
} from '#common/types/backend/function-errors/oc-session-ent-to-tab-error';

export type DbOcSessionsFindFirstError = OcSessionEntToTabError;

export let zDbOcSessionsFindFirstError = zOcSessionEntToTabError;

assertTypesEqual<
  DbOcSessionsFindFirstError,
  z.infer<typeof zDbOcSessionsFindFirstError>
>({
  value: true
});
