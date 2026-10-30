import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { makeUserFullName } from '#backend/functions/db/users/make-user-full-name/make-user-full-name';
import type { EnvUser } from '#common/types/backend/parts/env-user';

export function memberTabToApiEnvUser(item: { member: MemberTab }): EnvUser {
  let { member } = item;

  let apiEnvUser: EnvUser = {
    userId: member.memberId,
    alias: member.alias,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: makeUserFullName({
      firstName: member.firstName,
      lastName: member.lastName
    })
  };

  return apiEnvUser;
}
