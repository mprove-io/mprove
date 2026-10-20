import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcMessageEntToTabError,
  zOcMessageEntToTabError
} from '#common/types/backend/function-errors/oc-message-ent-to-tab-error';

export type DbOcMessagesFindFirstError = OcMessageEntToTabError;

export let zDbOcMessagesFindFirstError = zOcMessageEntToTabError;

assertTypesEqual<
  DbOcMessagesFindFirstError,
  z.infer<typeof zDbOcMessagesFindFirstError>
>({
  value: true
});
