import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';

export type DbMconfigsFindManyError = MconfigEntToTabError;

export let zDbMconfigsFindManyError = zMconfigEntToTabError;

assertTypesEqual<
  DbMconfigsFindManyError,
  z.infer<typeof zDbMconfigsFindManyError>
>({
  value: true
});
