import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type SessionEntToTabError,
  zSessionEntToTabError
} from '#common/types/backend/function-errors/session-ent-to-tab-error';

export type DbSessionsFindFirstError = SessionEntToTabError;

export let zDbSessionsFindFirstError = zSessionEntToTabError;

assertTypesEqual<
  DbSessionsFindFirstError,
  z.infer<typeof zDbSessionsFindFirstError>
>({
  value: true
});
