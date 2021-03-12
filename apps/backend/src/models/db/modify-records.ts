import { EntityManager } from 'typeorm';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';

export async function modifyRecords(item: {
  manager: EntityManager;
  // sourceInitId: string;
  // skipChunk?: boolean;
  records: interfaces.Records;
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
  let queries = records.queries;
  // let models = records.models;
  let vizs = records.vizs;
  // let mconfigs = records.mconfigs;
  let dashboards = records.dashboards;
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

  if (common.isDefined(dashboards) && dashboards.length > 0) {
    await manager
      .getCustomRepository(repositories.DashboardsRepository)
      .save(dashboards);
  }

  if (common.isDefined(vizs) && vizs.length > 0) {
    await manager.getCustomRepository(repositories.VizsRepository).save(vizs);
  }

  if (common.isDefined(queries) && queries.length > 0) {
    await manager
      .getCustomRepository(repositories.QueriesRepository)
      .save(queries);
  }

  return records;
}
