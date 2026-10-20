import type { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type DbMembersFindFirstError = MemberEntToTabError;

export let zDbMembersFindFirstError = zMemberEntToTabError;

assertTypesEqual<
  DbMembersFindFirstError,
  z.infer<typeof zDbMembersFindFirstError>
>({
  value: true
});
