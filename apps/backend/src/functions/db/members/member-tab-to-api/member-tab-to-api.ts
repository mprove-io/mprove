import type { MemberTab } from '#backend/drizzle/postgres/schema/_tabs';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import type { Member } from '#common/types/backend/parts/member';

export function memberTabToApi(item: { member: MemberTab }): Member {
  let { member } = item;

  let apiMember: Member = {
    projectId: member.projectId,
    memberId: member.memberId,
    email: member.email,
    alias: member.alias,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: makeFullName({
      firstName: member.firstName,
      lastName: member.lastName
    }),
    avatarSmall: undefined, // TODO: add avatar in tabToApi method?
    isAdmin: member.isAdmin,
    isEditor: member.isEditor,
    isExplorer: member.isExplorer,
    roles: member.roles,
    serverTs: member.serverTs
  };

  return apiMember;
}
