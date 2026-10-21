import { z } from 'zod';
import { assertTypesEqual } from '#common/functions/assert-types-equal/assert-types-equal';
import {
  type MemberTabToEntError,
  zMemberTabToEntError
} from '#common/types/backend/function-errors/member-tab-to-ent-error';
import {
  type OrgTabToEntError,
  zOrgTabToEntError
} from '#common/types/backend/function-errors/org-tab-to-ent-error';
import {
  type ProjectTabToEntError,
  zProjectTabToEntError
} from '#common/types/backend/function-errors/project-tab-to-ent-error';
import {
  type QueryTabToEntError,
  zQueryTabToEntError
} from '#common/types/backend/function-errors/query-tab-to-ent-error';
import {
  type UserTabToEntError,
  zUserTabToEntError
} from '#common/types/backend/function-errors/user-tab-to-ent-error';

export type ConvertTabsPackKeyError =
  | MemberTabToEntError
  | OrgTabToEntError
  | ProjectTabToEntError
  | QueryTabToEntError
  | UserTabToEntError;

export let zConvertTabsPackKeyError = z.union([
  zMemberTabToEntError,
  zOrgTabToEntError,
  zProjectTabToEntError,
  zQueryTabToEntError,
  zUserTabToEntError
]);

assertTypesEqual<
  ConvertTabsPackKeyError,
  z.infer<typeof zConvertTabsPackKeyError>
>({
  value: true
});
