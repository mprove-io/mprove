import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type MemberEntToTabResultError,
  zMemberEntToTabResultError
} from '#common/types/backend/function-errors/member-ent-to-tab-result-error';

export type GetMemberCheckExistsResultError =
  | BackendMemberDoesNotExistError
  | MemberEntToTabResultError;

export let zGetMemberCheckExistsResultError = z.union([
  zBackendMemberDoesNotExistError,
  zMemberEntToTabResultError
]);

assertTypesEqual<
  GetMemberCheckExistsResultError,
  z.infer<typeof zGetMemberCheckExistsResultError>
>({ value: true });
