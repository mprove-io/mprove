import { entities } from '~backend/barrels/entities';

export function makeEv(item: {
  projectId: string;
  envId: string;
  evId: string;
  val: string;
}) {
  let evEntity: entities.EvEntity = {
    project_id: item.projectId,
    env_id: item.envId,
    ev_id: item.evId,
    val: item.val,
    server_ts: undefined
  };
  return evEntity;
}
