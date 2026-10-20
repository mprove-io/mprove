import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcMessageEntToTabError,
  zOcMessageEntToTabError
} from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';

export type DbOcMessagesFindManyError = OcMessageEntToTabError;

export let zDbOcMessagesFindManyError = zOcMessageEntToTabError;

assertTypesEqual<
  DbOcMessagesFindManyError,
  z.infer<typeof zDbOcMessagesFindManyError>
>({
  value: true
});
