import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type DbMembersFindManyError = MemberEntToTabError;

export let zDbMembersFindManyError = zMemberEntToTabError;

assertTypesEqual<
  DbMembersFindManyError,
  z.infer<typeof zDbMembersFindManyError>
>({
  value: true
});
