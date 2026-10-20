import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbSessionsFindFirstError,
  zDbSessionsFindFirstError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-first-error';
import {
  type DbSessionsFindManyError,
  zDbSessionsFindManyError
} from '#common/types/backend/function-errors/db/sessions/db-sessions-find-many-error';
import {
  type TabsToSessionApisError,
  zTabsToSessionApisError
} from '#common/types/backend/function-errors/tabs-to-session-apis-error';

export type GetSessionListError =
  | TabsToSessionApisError
  | DbSessionsFindManyError
  | DbSessionsFindFirstError;

export let zGetSessionListError = z.union([
  zTabsToSessionApisError,
  zDbSessionsFindManyError,
  zDbSessionsFindFirstError
]);

assertTypesEqual<GetSessionListError, z.infer<typeof zGetSessionListError>>({
  value: true
});
