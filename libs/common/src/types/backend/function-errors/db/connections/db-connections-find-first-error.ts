import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';

export type DbConnectionsFindFirstError = ConnectionEntToTabError;

export let zDbConnectionsFindFirstError = zConnectionEntToTabError;

assertTypesEqual<
  DbConnectionsFindFirstError,
  z.infer<typeof zDbConnectionsFindFirstError>
>({
  value: true
});
