import { Injectable } from '@nestjs/common';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { maker } from '~backend/barrels/maker';
import { repositories } from '~backend/barrels/repositories';
import { wrapper } from '~backend/barrels/wrapper';
import { DbService } from '~backend/services/db.service';
import { RabbitService } from './rabbit.service';

@Injectable()
export class BlockmlService {
  constructor(
    private connectionsRepository: repositories.ConnectionsRepository,
    private rabbitService: RabbitService,
    private dbService: DbService
  ) {}

  async rebuildStruct(item: {
    traceId: string;
    projectId: string;
    structId: string;
    orgId: string;
    diskFiles: common.DiskCatalogFile[];
    skipDb?: boolean;
  }) {
    let { traceId, structId, orgId, projectId, diskFiles, skipDb } = item;

    let connections = await this.connectionsRepository.find({
      project_id: projectId
    });

    let toBlockmlRebuildStructRequest: apiToBlockml.ToBlockmlRebuildStructRequest = {
      info: {
        name: apiToBlockml.ToBlockmlRequestInfoNameEnum.ToBlockmlRebuildStruct,
        traceId: traceId
      },
      payload: {
        structId: structId,
        orgId: orgId,
        projectId: projectId,
        files: helper.diskFilesToBlockmlFiles(diskFiles),
        connections: connections.map(x => ({
          connectionId: x.connection_id,
          type: x.type,
          bigqueryProject: x.bigquery_project
        }))
      }
    };

    let blockmlRebuildStructResponse = await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlRebuildStructResponse>(
      {
        routingKey: common.RabbitBlockmlRoutingEnum.RebuildStruct.toString(),
        message: toBlockmlRebuildStructRequest,
        checkIsOk: true
      }
    );

    let {
      weekStart,
      allowTimezones,
      defaultTimezone,
      errors,
      views,
      udfsDict,
      vizs,
      mconfigs,
      queries,
      dashboards,
      models
    } = blockmlRebuildStructResponse.payload;

    let struct = maker.makeStruct({
      projectId: projectId,
      structId: structId,
      weekStart: weekStart,
      allowTimezones: common.booleanToEnum(allowTimezones),
      defaultTimezone: defaultTimezone,
      errors: errors,
      views: views,
      udfsDict: udfsDict
    });

    if (common.isUndefined(skipDb) || skipDb === false) {
      await this.dbService.writeRecords({
        modify: false,
        records: {
          structs: [struct],
          vizs: vizs.map(x => wrapper.wrapToEntityViz(x)),
          queries: queries.map(x => wrapper.wrapToEntityQuery(x)),
          models: models.map(x => wrapper.wrapToEntityModel(x)),
          mconfigs: mconfigs.map(x => wrapper.wrapToEntityMconfig(x)),
          dashboards: dashboards.map(x => wrapper.wrapToEntityDashboard(x))
        }
      });
    }

    return {
      struct: struct,
      vizs: vizs,
      queries: queries,
      models: models,
      mconfigs: mconfigs,
      dashboards: dashboards
    };
  }
}
