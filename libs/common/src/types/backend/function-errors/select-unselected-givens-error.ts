import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbMembersFindFirstError,
  zDbMembersFindFirstError
} from '#common/types/backend/function-errors/db/members/db-members-find-first-error';
import {
  type GetMemberGivensForSelectionError,
  zGetMemberGivensForSelectionError
} from '#common/types/backend/function-errors/get-member-givens-for-selection-error';

export type SelectUnselectedGivensError =
  | GetMemberGivensForSelectionError
  | DbMembersFindFirstError;

export const zSelectUnselectedGivensError = z.union([
  zGetMemberGivensForSelectionError,
  zDbMembersFindFirstError
]);

assertTypesEqual<
  SelectUnselectedGivensError,
  z.infer<typeof zSelectUnselectedGivensError>
>({ value: true });
