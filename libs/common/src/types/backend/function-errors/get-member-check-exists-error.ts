import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type BackendMemberDoesNotExistError,
  zBackendMemberDoesNotExistError
} from '#common/types/backend/errors/backend-member-does-not-exist-error';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';

export type GetMemberCheckExistsError =
  | BackendMemberDoesNotExistError
  | MemberEntToTabError;

export let zGetMemberCheckExistsError = z.union([
  zBackendMemberDoesNotExistError,
  zMemberEntToTabError
]);

assertTypesEqual<
  GetMemberCheckExistsError,
  z.infer<typeof zGetMemberCheckExistsError>
>({ value: true });
