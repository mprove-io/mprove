import type { MemberTabToEntError } from '#common/types/backend/function-errors/member-tab-to-ent-error';
import type { OrgTabToEntError } from '#common/types/backend/function-errors/org-tab-to-ent-error';
import type { ProjectTabToEntError } from '#common/types/backend/function-errors/project-tab-to-ent-error';
import type { QueryTabToEntError } from '#common/types/backend/function-errors/query-tab-to-ent-error';
import type { UserTabToEntError } from '#common/types/backend/function-errors/user-tab-to-ent-error';

export type TabsPackToEntsPackError =
  | MemberTabToEntError
  | OrgTabToEntError
  | ProjectTabToEntError
  | QueryTabToEntError
  | UserTabToEntError;
