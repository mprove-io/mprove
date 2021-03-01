import { EntityManager } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { repositories } from '~backend/barrels/repositories';

export async function modifyRecords(item: {
  manager: EntityManager;
  // sourceInitId: string;
  // skipChunk?: boolean;
  records: {
    users?: entities.UserEntity[];
    orgs?: entities.OrgEntity[];
    projects?: entities.ProjectEntity[];
    members?: entities.MemberEntity[];
    connections?: entities.ConnectionEntity[];
    branches?: entities.BranchEntity[];
    // repos?: entities.RepoEntity[];
    // files?: entities.FileEntity[];
    // queries?: entities.QueryEntity[];
    // models?: entities.ModelEntity[];
    // views?: entities.ViewEntity[];
    // mconfigs?: entities.MconfigEntity[];
    // dashboards?: entities.DashboardEntity[];
    // errors?: entities.ErrorEntity[];
  };
}) {
  let { manager, records } = item;

  let newServerTs = helper.makeTs();

  Object.keys(records).forEach(key => {
    helper.refreshServerTs(records[key], newServerTs);
  });

  // if (!item.skipChunk) {
  //   let chunkId = common.makeId();

  //   let chunk = generator.makeChunk({
  //     chunk_id: chunkId,
  //     records: item.records,
  //     source_session_id: item.sourceInitId,
  //     server_ts: item.serverTs
  //   });

  //   let storeChunks = getChunksRepo(manager);

  //   await storeChunks
  //     .insert(chunk)
  //     .catch(e => helper.reThrow(e, enums.storeErrorsEnum.STORE_CHUNKS_INSERT));
  // }

  let users = records.users;
  let orgs = records.orgs;
  let projects = records.projects;
  let members = records.members;
  let connections = records.connections;
  let branches = records.branches;
  // let repos = records.repos;
  // let files = records.files;
  // let queries = records.queries;
  // let models = records.models;
  // let views = records.views;
  // let mconfigs = records.mconfigs;
  // let dashboards = records.dashboards;
  // let errors = records.errors;

  if (common.isDefined(users) && users.length > 0) {
    await manager.getCustomRepository(repositories.UsersRepository).save(users);
  }

  if (common.isDefined(orgs) && orgs.length > 0) {
    await manager.getCustomRepository(repositories.OrgsRepository).save(orgs);
  }

  if (common.isDefined(projects) && projects.length > 0) {
    await manager
      .getCustomRepository(repositories.ProjectsRepository)
      .save(projects);
  }

  if (common.isDefined(members) && members.length > 0) {
    await manager
      .getCustomRepository(repositories.MembersRepository)
      .save(members);
  }

  if (common.isDefined(connections) && connections.length > 0) {
    await manager
      .getCustomRepository(repositories.ConnectionsRepository)
      .save(connections);
  }

  if (common.isDefined(branches) && branches.length > 0) {
    await manager
      .getCustomRepository(repositories.BranchesRepository)
      .save(branches);
  }
}
