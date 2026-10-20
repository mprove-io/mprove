import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MconfigEntToTabError,
  zMconfigEntToTabError
} from '#common/types/backend/function-errors/mconfig-ent-to-tab-error';

export type DbMconfigsFindFirstError = MconfigEntToTabError;

export let zDbMconfigsFindFirstError = zMconfigEntToTabError;

assertTypesEqual<
  DbMconfigsFindFirstError,
  z.infer<typeof zDbMconfigsFindFirstError>
>({
  value: true
});
