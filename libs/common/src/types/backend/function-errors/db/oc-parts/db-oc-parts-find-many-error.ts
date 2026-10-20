import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type OcPartEntToTabError,
  zOcPartEntToTabError
} from '#common/types/backend/function-errors/oc-part-ent-to-tab-error';

export type DbOcPartsFindManyError = OcPartEntToTabError;

export let zDbOcPartsFindManyError = zOcPartEntToTabError;

assertTypesEqual<
  DbOcPartsFindManyError,
  z.infer<typeof zDbOcPartsFindManyError>
>({
  value: true
});
