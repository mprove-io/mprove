import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type DbErrorToError,
  zDbErrorToError
} from '#common/types/backend/function-errors/db-error-to-error';
import {
  type MemberEntToTabError,
  zMemberEntToTabError
} from '#common/types/backend/function-errors/member-ent-to-tab-error';
import {
  type ProjectEntToTabError,
  zProjectEntToTabError
} from '#common/types/backend/function-errors/project-ent-to-tab-error';
import {
  type RebuildStructError,
  zRebuildStructError
} from '#common/types/backend/function-errors/rebuild-struct-error';
import {
  type SendToDiskError,
  zSendToDiskError
} from '#common/types/backend/function-errors/send-to-disk-error';

export type AddMemberToDemoProjectError =
  | ProjectEntToTabError
  | MemberEntToTabError
  | SendToDiskError
  | RebuildStructError
  | DbErrorToError;

export const zAddMemberToDemoProjectError = z.union([
  zProjectEntToTabError,
  zMemberEntToTabError,
  zSendToDiskError,
  zRebuildStructError,
  zDbErrorToError
]);

assertTypesEqual<
  AddMemberToDemoProjectError,
  z.infer<typeof zAddMemberToDemoProjectError>
>({ value: true });
