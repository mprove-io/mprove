import { common } from '~backend/barrels/common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { makeFullName } from '~backend/functions/make-full-name';

export function wrapToApiMember(x: schemaPostgres.MemberEnt): common.Member {
  return {
    projectId: x.projectId,
    memberId: x.memberId,
    email: x.email,
    alias: x.alias,
    firstName: x.firstName,
    lastName: x.lastName,
    fullName: makeFullName({ firstName: x.firstName, lastName: x.lastName }),
    avatarSmall: undefined,
    timezone: x.timezone,
    isAdmin: x.isAdmin,
    isEditor: x.isEditor,
    isExplorer: x.isExplorer,
    roles: x.roles,
    envs: x.envs,
    serverTs: x.serverTs
  };
}
