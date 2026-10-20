import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcPartEntToTabError,
  zOcPartEntToTabError
} from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';

export type DbOcPartsFindFirstError = OcPartEntToTabError;

export let zDbOcPartsFindFirstError = zOcPartEntToTabError;

assertTypesEqual<
  DbOcPartsFindFirstError,
  z.infer<typeof zDbOcPartsFindFirstError>
>({
  value: true
});
