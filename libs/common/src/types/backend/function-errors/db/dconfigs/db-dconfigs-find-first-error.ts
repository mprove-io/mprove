import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DconfigEntToTabError,
  zDconfigEntToTabError
} from '#common/types/backend/function-errors/dconfig-ent-to-tab-error';

export type DbDconfigsFindFirstError = DconfigEntToTabError;

export let zDbDconfigsFindFirstError = zDconfigEntToTabError;

assertTypesEqual<
  DbDconfigsFindFirstError,
  z.infer<typeof zDbDconfigsFindFirstError>
>({
  value: true
});
