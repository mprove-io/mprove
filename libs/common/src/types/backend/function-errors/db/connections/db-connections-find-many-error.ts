import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type ConnectionEntToTabError,
  zConnectionEntToTabError
} from '#common/types/backend/function-errors/connection-ent-to-tab-error';

export type DbConnectionsFindManyError = ConnectionEntToTabError;

export let zDbConnectionsFindManyError = zConnectionEntToTabError;

assertTypesEqual<
  DbConnectionsFindManyError,
  z.infer<typeof zDbConnectionsFindManyError>
>({
  value: true
});
