import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionEntToTabError,
  zSessionEntToTabError
} from '#common/types/backend/function-errors/session-ent-to-tab-error';
import {
  type TabsToSessionApisError,
  zTabsToSessionApisError
} from '#common/types/backend/function-errors/tabs-to-session-apis-error';

export type GetBasicSessionsListError =
  | TabsToSessionApisError
  | SessionEntToTabError;

export let zGetBasicSessionsListError = z.union([
  zTabsToSessionApisError,
  zSessionEntToTabError
]);

assertTypesEqual<
  GetBasicSessionsListError,
  z.infer<typeof zGetBasicSessionsListError>
>({ value: true });
