import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';

export function wrapToApiEvar(evar: entities.EvarEntity): common.Evar {
  return {
    projectId: evar.project_id,
    envId: evar.env_id,
    evarId: evar.evar_id,
    value: evar.value
  };
}
