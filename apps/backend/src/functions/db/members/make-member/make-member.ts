import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import type { UserTab } from '#backend/drizzle/postgres/tables/users';
import { makeMemberFullId } from '#backend/functions/db/members/make-member-full-id/make-member-full-id';

export function makeMember(item: {
  projectId: string;
  roles?: string[];
  user: UserTab;
  isAdmin: boolean;
  isEditor: boolean;
  isExplorer: boolean;
}): MemberTab {
  let { projectId, roles, user, isAdmin, isEditor, isExplorer } = item;

  let member: MemberTab = {
    memberFullId: makeMemberFullId({
      projectId: projectId,
      memberId: user.userId
    }),
    projectId: projectId,
    memberId: user.userId,
    isAdmin: isAdmin,
    isEditor: isEditor,
    isExplorer: isExplorer,
    email: user.email,
    alias: user.alias,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: roles || [],
    emailHash: undefined, // tab-to-ent
    aliasHash: undefined, // tab-to-ent
    keyTag: undefined,
    serverTs: undefined
  };

  return member;
}
