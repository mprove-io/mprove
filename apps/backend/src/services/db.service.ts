import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { repositories } from '~backend/barrels/repositories';

let retry = require('async-retry');

@Injectable()
export class DbService {
  constructor(private connection: Connection) {}

  async writeRecords(item: { records: interfaces.Records; modify: boolean }) {
    let { records, modify } = item;

    await retry(
      async (bail: any) => {
        records =
          modify === true
            ? await this.modify({ records: records })
            : await this.add({ records: records });
      },
      {
        retries: 3, // (default 10)
        minTimeout: 1000, // ms (default 1000)
        factor: 1, // (default 2)
        randomize: true, // 1 to 2 (default true)
        onRetry: (e: any) => {
          let serverError = new common.ServerError({
            message: common.ErEnum.BACKEND_TRANSACTION_RETRY,
            originalError: e
          });

          common.logToConsole(serverError);
        }
      }
    );

    return records;
  }

  private async add(item: {
    records: interfaces.Records;
    // sourceInitId: string;
    // skipChunk?: boolean;
  }) {
    let { records } = item;

    let newServerTs = helper.makeTs();

    Object.keys(records).forEach(key => {
      if (common.isDefined(records[key as keyof interfaces.Records])) {
        helper.refreshServerTs(
          records[key as keyof interfaces.Records] as any,
          newServerTs
        );
      }
    });

    await this.connection.transaction(async manager => {
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

      let {
        users,
        avatars,
        orgs,
        projects,
        envs,
        members,
        connections,
        structs,
        branches,
        bridges,
        vizs,
        queries,
        models,
        mconfigs,
        dashboards,
        notes
      } = records;

      if (common.isDefined(users) && users.length > 0) {
        await manager
          .getCustomRepository(repositories.UsersRepository)
          .insert(users);
      }

      if (common.isDefined(avatars) && avatars.length > 0) {
        await manager
          .getCustomRepository(repositories.AvatarsRepository)
          .insert(avatars);
      }

      if (common.isDefined(orgs) && orgs.length > 0) {
        await manager
          .getCustomRepository(repositories.OrgsRepository)
          .insert(orgs);
      }

      if (common.isDefined(projects) && projects.length > 0) {
        await manager
          .getCustomRepository(repositories.ProjectsRepository)
          .insert(projects);
      }

      if (common.isDefined(envs) && envs.length > 0) {
        await manager
          .getCustomRepository(repositories.EnvsRepository)
          .insert(envs);
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

      if (common.isDefined(branches) && branches.length > 0) {
        await manager
          .getCustomRepository(repositories.BranchesRepository)
          .insert(branches);
      }

      if (common.isDefined(bridges) && bridges.length > 0) {
        await manager
          .getCustomRepository(repositories.BridgesRepository)
          .insert(bridges);
      }

      if (common.isDefined(structs) && structs.length > 0) {
        await manager
          .getCustomRepository(repositories.StructsRepository)
          .insert(structs);
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

      if (common.isDefined(vizs) && vizs.length > 0) {
        await manager
          .getCustomRepository(repositories.VizsRepository)
          .insert(vizs);
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

      if (common.isDefined(notes) && notes.length > 0) {
        await manager
          .getCustomRepository(repositories.NotesRepository)
          .insert(notes);
      }
    });

    return records;
  }

  private async modify(item: {
    records: interfaces.Records;
    // sourceInitId: string;
    // skipChunk?: boolean;
  }) {
    let { records } = item;

    let newServerTs = helper.makeTs();

    Object.keys(records).forEach(key => {
      if (common.isDefined(records[key as keyof interfaces.Records])) {
        helper.refreshServerTs(
          records[key as keyof interfaces.Records] as any,
          newServerTs
        );
      }
    });

    await this.connection.transaction(async manager => {
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

      let {
        users,
        avatars,
        orgs,
        projects,
        envs,
        members,
        connections,
        structs,
        branches,
        bridges,
        vizs,
        queries,
        models,
        mconfigs,
        dashboards,
        notes
      } = records;

      if (common.isDefined(users) && users.length > 0) {
        await manager
          .getCustomRepository(repositories.UsersRepository)
          .save(users);
      }

      if (common.isDefined(avatars) && avatars.length > 0) {
        await manager
          .getCustomRepository(repositories.AvatarsRepository)
          .save(avatars);
      }

      if (common.isDefined(orgs) && orgs.length > 0) {
        await manager
          .getCustomRepository(repositories.OrgsRepository)
          .save(orgs);
      }

      if (common.isDefined(projects) && projects.length > 0) {
        await manager
          .getCustomRepository(repositories.ProjectsRepository)
          .save(projects);
      }

      if (common.isDefined(envs) && envs.length > 0) {
        await manager
          .getCustomRepository(repositories.EnvsRepository)
          .save(envs);
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

      if (common.isDefined(bridges) && bridges.length > 0) {
        await manager
          .getCustomRepository(repositories.BridgesRepository)
          .save(bridges);
      }

      if (common.isDefined(structs) && structs.length > 0) {
        await manager
          .getCustomRepository(repositories.StructsRepository)
          .save(structs);
      }

      if (common.isDefined(models) && models.length > 0) {
        await manager
          .getCustomRepository(repositories.ModelsRepository)
          .save(models);
      }

      if (common.isDefined(mconfigs) && mconfigs.length > 0) {
        await manager
          .getCustomRepository(repositories.MconfigsRepository)
          .save(mconfigs);
      }

      if (common.isDefined(dashboards) && dashboards.length > 0) {
        await manager
          .getCustomRepository(repositories.DashboardsRepository)
          .save(dashboards);
      }

      if (common.isDefined(vizs) && vizs.length > 0) {
        await manager
          .getCustomRepository(repositories.VizsRepository)
          .save(vizs);
      }

      if (common.isDefined(queries) && queries.length > 0) {
        await manager
          .getCustomRepository(repositories.QueriesRepository)
          .save(queries);
      }

      if (common.isDefined(notes) && notes.length > 0) {
        await manager
          .getCustomRepository(repositories.NotesRepository)
          .save(notes);
      }
    });

    return records;
  }
}
