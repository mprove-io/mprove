import { EntityManager } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';

export async function addRecords(item: {
  manager: EntityManager;
  // sourceInitId: string;
  // skipChunk?: boolean;
  records: {
    users?: entities.UserEntity[];
    orgs?: entities.OrgEntity[];
    projects?: entities.ProjectEntity[];
    // repos?: entities.RepoEntity[];
    // files?: entities.FileEntity[];
    // queries?: entities.QueryEntity[];
    // models?: entities.ModelEntity[];
    // views?: entities.ViewEntity[];
    // mconfigs?: entities.MconfigEntity[];
    // dashboards?: entities.DashboardEntity[];
    // errors?: entities.ErrorEntity[];
    // members?: entities.MemberEntity[];
  };
}) {
  let { manager, records } = item;

  let newServerTs = helper.makeTs();

  Object.keys(records).forEach(key => {
    helper.refreshServerTs(records[key], newServerTs);
  });

  // if (!item.skip_chunk) {
  //   let chunkId = common.makeId();

  //   let chunk = gen.makeChunk({
  //     chunk_id: chunkId,
  //     records: item.records,
  //     source_session_id: item.source_init_id,
  //     server_ts: item.server_ts
  //   });

  //   let storeChunks = getChunksRepo(manager);

  //   await storeChunks
  //     .insert(chunk)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_INSERT));
  // }

  let users = records.users;
  let orgs = records.orgs;
  let projects = records.projects;
  // let repos = records.repos;
  // let files = records.files;
  // let queries = records.queries;
  // let models = records.models;
  // let views = records.views;
  // let mconfigs = records.mconfigs;
  // let dashboards = records.dashboards;
  // let errors = records.errors;
  // let members = records.members;

  if (common.isDefined(users) && users.length > 0) {
    await manager
      .getCustomRepository(repositories.UsersRepository)
      .insert(users);
  }

  if (common.isDefined(orgs) && orgs.length > 0) {
    await manager.getCustomRepository(repositories.OrgsRepository).insert(orgs);
  }

  if (common.isDefined(projects) && projects.length > 0) {
    await manager
      .getCustomRepository(repositories.ProjectsRepository)
      .insert(projects);
  }
}
