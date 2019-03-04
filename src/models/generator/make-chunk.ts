import { entities } from '../../barrels/entities';
import { interfaces } from '../../barrels/interfaces';

export function makeChunk(item: {
  chunk_id: string,
  records: {
    users?: entities.UserEntity[],
    projects?: entities.ProjectEntity[],
    repos?: entities.RepoEntity[],
    files?: entities.FileEntity[],
    queries?: entities.QueryEntity[],
    models?: entities.ModelEntity[],
    mconfigs?: entities.MconfigEntity[],
    dashboards?: entities.DashboardEntity[],
    errors?: entities.ErrorEntity[],
    members?: entities.MemberEntity[]
  },
  source_session_id: string,
  server_ts: string,
}): entities.ChunkEntity {

  let records = item.records;

  let contentParsed: interfaces.ChunkContentParsed = {
    users: records.users ? records.users : [],
    projects: records.projects ? records.projects : [],
    repos: records.repos ? records.repos : [],
    files: records.files ? records.files : [],
    queries: records.queries ? records.queries : [],
    models: records.models ? records.models : [],
    mconfigs: records.mconfigs ? records.mconfigs : [],
    dashboards: records.dashboards ? records.dashboards : [],
    errors: records.errors ? records.errors : [],
    members: records.members ? records.members : [],
  };

  return {
    chunk_id: item.chunk_id,
    content: JSON.stringify(contentParsed),
    source_session_id: item.source_session_id,
    server_ts: item.server_ts,
  };
}
