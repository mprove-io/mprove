import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { makeFullName } from '~backend/functions/make-full-name';

export function wrapToApiEnv(item: {
  env: entities.EnvEntity;
  envConnectionIds: string[];
  envMembers: entities.MemberEntity[];
}): common.Env {
  let { env, envConnectionIds, envMembers } = item;

  let envUsers: common.EnvUser[] = [];

  envMembers.forEach(x => {
    let envUser: common.EnvUser = {
      alias: x.alias,
      firstName: x.first_name,
      lastName: x.last_name,
      fullName: makeFullName({ firstName: x.first_name, lastName: x.last_name })
    };

    envUsers.push(envUser);
  });

  return {
    projectId: env.project_id,
    envId: env.env_id,
    envConnectionIds: envConnectionIds,
    envUsers: envUsers
  };
}
