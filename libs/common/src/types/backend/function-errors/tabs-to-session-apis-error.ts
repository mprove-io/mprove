import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbOcSessionsFindManyError,
  zDbOcSessionsFindManyError
} from '#common/types/backend/function-errors/db/oc-sessions/db-oc-sessions-find-many-error';

export type TabsToSessionApisError = DbOcSessionsFindManyError;

export let zTabsToSessionApisError = zDbOcSessionsFindManyError;

assertTypesEqual<
  TabsToSessionApisError,
  z.infer<typeof zTabsToSessionApisError>
>({ value: true });
