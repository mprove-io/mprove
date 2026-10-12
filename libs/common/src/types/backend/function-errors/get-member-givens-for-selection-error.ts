import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiGivensError,
  zGetApiGivensError
} from '#common/types/backend/function-errors/get-api-givens-error';
import {
  type GetApiRolesError,
  zGetApiRolesError
} from '#common/types/backend/function-errors/get-api-roles-error';

export type GetMemberGivensForSelectionError =
  | GetApiGivensError
  | GetApiRolesError;

export let zGetMemberGivensForSelectionError = z.union([
  zGetApiGivensError,
  zGetApiRolesError
]);

assertTypesEqual<
  GetMemberGivensForSelectionError,
  z.infer<typeof zGetMemberGivensForSelectionError>
>({ value: true });
