import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { common } from '~backend/barrels/common';
import { entities } from '~backend/barrels/entities';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { logToConsoleBackend } from '~backend/functions/log-to-console-backend';

let retry = require('async-retry');

@Injectable()
export class DbService {
  constructor(
    private dataSource: DataSource,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger
  ) {}

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
          logToConsoleBackend({
            log: new common.ServerError({
              message: common.ErEnum.BACKEND_TRANSACTION_RETRY,
              originalError: e
            }),
            logLevel: common.LogLevelEnum.Error,
            logger: this.logger,
            cs: this.cs
          });
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

    await this.dataSource.transaction(async manager => {
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
        evs,
        members,
        connections,
        structs,
        branches,
        bridges,
        vizs,
        queries,
        models,
        metrics,
        reps,
        apis,
        mconfigs,
        kits,
        dashboards,
        notes
      } = records;

      if (common.isDefined(users) && users.length > 0) {
        await manager.getRepository(entities.UserEntity).insert(users);
      }

      if (common.isDefined(avatars) && avatars.length > 0) {
        await manager.getRepository(entities.AvatarEntity).insert(avatars);
      }

      if (common.isDefined(orgs) && orgs.length > 0) {
        await manager.getRepository(entities.OrgEntity).insert(orgs);
      }

      if (common.isDefined(projects) && projects.length > 0) {
        await manager.getRepository(entities.ProjectEntity).insert(projects);
      }

      if (common.isDefined(envs) && envs.length > 0) {
        await manager.getRepository(entities.EnvEntity).insert(envs);
      }

      if (common.isDefined(evs) && evs.length > 0) {
        await manager.getRepository(entities.EvEntity).insert(evs);
      }

      if (common.isDefined(members) && members.length > 0) {
        await manager.getRepository(entities.MemberEntity).insert(members);
      }

      if (common.isDefined(connections) && connections.length > 0) {
        await manager
          .getRepository(entities.ConnectionEntity)
          .insert(connections);
      }

      if (common.isDefined(branches) && branches.length > 0) {
        await manager.getRepository(entities.BranchEntity).insert(branches);
      }

      if (common.isDefined(bridges) && bridges.length > 0) {
        await manager.getRepository(entities.BridgeEntity).insert(bridges);
      }

      if (common.isDefined(structs) && structs.length > 0) {
        await manager.getRepository(entities.StructEntity).insert(structs);
      }

      if (common.isDefined(models) && models.length > 0) {
        await manager.getRepository(entities.ModelEntity).insert(models);
      }

      if (common.isDefined(metrics) && metrics.length > 0) {
        await manager.getRepository(entities.MetricEntity).insert(metrics);
      }

      if (common.isDefined(reps) && reps.length > 0) {
        await manager.getRepository(entities.RepEntity).insert(reps);
      }

      if (common.isDefined(apis) && apis.length > 0) {
        await manager.getRepository(entities.ApiEntity).insert(apis);
      }

      if (common.isDefined(mconfigs) && mconfigs.length > 0) {
        await manager.getRepository(entities.MconfigEntity).insert(mconfigs);
      }

      if (common.isDefined(kits) && kits.length > 0) {
        await manager.getRepository(entities.KitEntity).insert(kits);
      }

      if (common.isDefined(dashboards) && dashboards.length > 0) {
        await manager
          .getRepository(entities.DashboardEntity)
          .insert(dashboards);
      }

      if (common.isDefined(vizs) && vizs.length > 0) {
        await manager.getRepository(entities.VizEntity).insert(vizs);
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
        await manager.getRepository(entities.NoteEntity).insert(notes);
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

    await this.dataSource.transaction(async manager => {
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
        evs,
        members,
        connections,
        structs,
        branches,
        bridges,
        vizs,
        queries,
        models,
        metrics,
        reps,
        apis,
        mconfigs,
        kits,
        dashboards,
        notes
      } = records;

      if (common.isDefined(users) && users.length > 0) {
        await manager.getRepository(entities.UserEntity).save(users);
      }

      if (common.isDefined(avatars) && avatars.length > 0) {
        await manager.getRepository(entities.AvatarEntity).save(avatars);
      }

      if (common.isDefined(orgs) && orgs.length > 0) {
        await manager.getRepository(entities.OrgEntity).save(orgs);
      }

      if (common.isDefined(projects) && projects.length > 0) {
        await manager.getRepository(entities.ProjectEntity).save(projects);
      }

      if (common.isDefined(envs) && envs.length > 0) {
        await manager.getRepository(entities.EnvEntity).save(envs);
      }

      if (common.isDefined(evs) && evs.length > 0) {
        await manager.getRepository(entities.EvEntity).save(evs);
      }

      if (common.isDefined(members) && members.length > 0) {
        await manager.getRepository(entities.MemberEntity).save(members);
      }

      if (common.isDefined(connections) && connections.length > 0) {
        await manager
          .getRepository(entities.ConnectionEntity)
          .save(connections);
      }

      if (common.isDefined(branches) && branches.length > 0) {
        await manager.getRepository(entities.BranchEntity).save(branches);
      }

      if (common.isDefined(bridges) && bridges.length > 0) {
        await manager.getRepository(entities.BridgeEntity).save(bridges);
      }

      if (common.isDefined(structs) && structs.length > 0) {
        await manager.getRepository(entities.StructEntity).save(structs);
      }

      if (common.isDefined(models) && models.length > 0) {
        await manager.getRepository(entities.ModelEntity).save(models);
      }

      if (common.isDefined(metrics) && metrics.length > 0) {
        await manager.getRepository(entities.MetricEntity).save(metrics);
      }

      if (common.isDefined(reps) && reps.length > 0) {
        await manager.getRepository(entities.RepEntity).save(reps);
      }

      if (common.isDefined(apis) && apis.length > 0) {
        await manager.getRepository(entities.ApiEntity).save(apis);
      }

      if (common.isDefined(mconfigs) && mconfigs.length > 0) {
        await manager.getRepository(entities.MconfigEntity).save(mconfigs);
      }

      if (common.isDefined(kits) && kits.length > 0) {
        await manager.getRepository(entities.KitEntity).save(kits);
      }

      if (common.isDefined(dashboards) && dashboards.length > 0) {
        await manager.getRepository(entities.DashboardEntity).save(dashboards);
      }

      if (common.isDefined(vizs) && vizs.length > 0) {
        await manager.getRepository(entities.VizEntity).save(vizs);
      }

      if (common.isDefined(queries) && queries.length > 0) {
        await manager.getRepository(entities.QueryEntity).save(queries);
      }

      if (common.isDefined(notes) && notes.length > 0) {
        await manager.getRepository(entities.NoteEntity).save(notes);
      }
    });

    return records;
  }
}
