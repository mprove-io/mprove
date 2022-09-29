import { entities } from '~backend/barrels/entities';

export function makeEvar(item: {
  projectId: string;
  envId: string;
  evarId: string;
  value: string;
}) {
  let evarEntity: entities.EvarEntity = {
    project_id: item.projectId,
    env_id: item.envId,
    evar_id: item.evarId,
    value: item.value,
    server_ts: undefined
  };
  return evarEntity;
}
