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

export type GetSessionListError = TabsToSessionApisError | SessionEntToTabError;

export let zGetSessionListError = z.union([
  zTabsToSessionApisError,
  zSessionEntToTabError
]);

assertTypesEqual<GetSessionListError, z.infer<typeof zGetSessionListError>>({
  value: true
});
