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
    members?: entities.MemberEntity[];
    connections?: entities.ConnectionEntity[];
    structs?: entities.StructEntity[];
    branches?: entities.BranchEntity[];
    vizs?: entities.VizEntity[];
    queries?: entities.QueryEntity[];
    models?: entities.ModelEntity[];
    mconfigs?: entities.MconfigEntity[];
    dashboards?: entities.DashboardEntity[];
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
  let members = records.members;
  let connections = records.connections;
  let structs = records.structs;
  let branches = records.branches;
  let vizs = records.vizs;
  let queries = records.queries;
  let models = records.models;
  let mconfigs = records.mconfigs;
  let dashboards = records.dashboards;

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

  if (common.isDefined(members) && members.length > 0) {
    await manager
      .getCustomRepository(repositories.MembersRepository)
      .insert(members);
  }

  if (common.isDefined(connections) && connections.length > 0) {
    await manager
      .getCustomRepository(repositories.ConnectionsRepository)
      .insert(connections);
  }

  if (common.isDefined(structs) && structs.length > 0) {
    await manager
      .getCustomRepository(repositories.StructsRepository)
      .insert(structs);
  }

  if (common.isDefined(branches) && branches.length > 0) {
    await manager
      .getCustomRepository(repositories.BranchesRepository)
      .insert(branches);
  }

  if (common.isDefined(vizs) && vizs.length > 0) {
    await manager.getCustomRepository(repositories.VizsRepository).insert(vizs);
  }

  if (common.isDefined(queries) && queries.length > 0) {
    await manager.connection
      .createQueryBuilder()
      .insert()
      .into(entities.QueryEntity)
      .values(queries)
      .orIgnore()
      .execute();
  }

  if (common.isDefined(models) && models.length > 0) {
    await manager
      .getCustomRepository(repositories.ModelsRepository)
      .insert(models);
  }

  if (common.isDefined(mconfigs) && mconfigs.length > 0) {
    await manager
      .getCustomRepository(repositories.MconfigsRepository)
      .insert(mconfigs);
  }

  if (common.isDefined(dashboards) && dashboards.length > 0) {
    await manager
      .getCustomRepository(repositories.DashboardsRepository)
      .insert(dashboards);
  }

  // avatars
}
