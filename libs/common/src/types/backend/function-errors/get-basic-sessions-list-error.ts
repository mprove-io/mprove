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

export type GetBasicSessionsListError =
  | TabsToSessionApisError
  | DbSessionsFindManyError
  | DbSessionsFindFirstError;

export let zGetBasicSessionsListError = z.union([
  zTabsToSessionApisError,
  zDbSessionsFindManyError,
  zDbSessionsFindFirstError
]);

assertTypesEqual<
  GetBasicSessionsListError,
  z.infer<typeof zGetBasicSessionsListError>
>({ value: true });
