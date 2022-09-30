import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiEv(ev: entities.EvEntity): common.Ev {
  return {
    projectId: ev.project_id,
    envId: ev.env_id,
    evId: ev.ev_id,
    value: ev.value
  };
}
