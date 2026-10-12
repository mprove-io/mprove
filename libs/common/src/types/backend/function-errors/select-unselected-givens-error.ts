import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetMemberGivensForSelectionError,
  zGetMemberGivensForSelectionError
} from '#common/types/backend/function-errors/get-member-givens-for-selection-error';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type SelectUnselectedGivensError =
  | MemberEntToTabError
  | GetMemberGivensForSelectionError;

export const zSelectUnselectedGivensError = z.union([
  zMemberEntToTabError,
  zGetMemberGivensForSelectionError
]);

assertTypesEqual<
  SelectUnselectedGivensError,
  z.infer<typeof zSelectUnselectedGivensError>
>({ value: true });
