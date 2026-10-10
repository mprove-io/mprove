import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type GetApiGivensResultError,
  zGetApiGivensResultError
} from '#common/types/backend/function-errors/get-api-givens-result-error';
import {
  type GetApiRolesResultError,
  zGetApiRolesResultError
} from '#common/types/backend/function-errors/get-api-roles-result-error';

export type GetMemberGivensForSelectionResultError =
  | GetApiGivensResultError
  | GetApiRolesResultError;

export let zGetMemberGivensForSelectionResultError = z.union([
  zGetApiGivensResultError,
  zGetApiRolesResultError
]);

assertTypesEqual<
  GetMemberGivensForSelectionResultError,
  z.infer<typeof zGetMemberGivensForSelectionResultError>
>({ value: true });
