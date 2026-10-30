import type { MemberTab } from '#backend/drizzle/postgres/tables/members';
import { makeFullName } from '#backend/functions/make-full-name/make-full-name';
import type { EnvUser } from '#common/types/backend/parts/env-user';

export function memberTabToApiEnvUser(item: { member: MemberTab }): EnvUser {
  let { member } = item;

  let apiEnvUser: EnvUser = {
    userId: member.memberId,
    alias: member.alias,
    firstName: member.firstName,
    lastName: member.lastName,
    fullName: makeFullName({
      firstName: member.firstName,
      lastName: member.lastName
    })
  };

  return apiEnvUser;
}
