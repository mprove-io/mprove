import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { interfaces } from '../barrels/interfaces';
import { barSpecial } from '../barrels/bar-special';
import { helper } from '../barrels/helper';
import { RabbitService } from './rabbit.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QueryService {
  constructor(
    private rabbitService: RabbitService,
    private configService: ConfigService<interfaces.Config>
  ) {}

  async processQuery(item: {
    traceId: string;
    organizationId: string;
    projectId: string;
    weekStart: api.ProjectWeekStartEnum;
    udfsDict: api.UdfsDict;
    mconfig: api.Mconfig;
    model: interfaces.Model;
  }) {
    let {
      traceId,
      organizationId,
      projectId,
      weekStart,
      udfsDict,
      mconfig,
      model
    } = item;

    let { select, sorts, timezone, limit, filters } = mconfig;

    let newFilters: interfaces.FilterBricksDictionary = {};

    filters.forEach(f => {
      let fieldId = f.fieldId;
      let bricks = f.fractions.map(fraction => fraction.brick);
      newFilters[fieldId] = bricks;
    });

    let { sql, filtersFractions, varsSqlSteps } = await barSpecial.genSql(
      this.rabbitService,
      this.configService,
      traceId,
      {
        weekStart: weekStart,
        timezone: timezone,
        select: select,
        sorts: sorts,
        limit: limit.toString(),
        filters: newFilters,
        model: model,
        udfsDict: udfsDict
      }
    );

    let queryId = helper.makeQueryId({
      organizationId: organizationId,
      projectId: projectId,
      connection: model.connection,
      sql: sql
    });

    let query: api.Query = {
      queryId: queryId,
      sql: sql,
      status: api.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: 1,
      lastCancelTs: 1,
      lastCompleteTs: 1,
      lastCompleteDuration: undefined,
      lastErrorMessage: undefined,
      lastErrorTs: 1,
      data: undefined,
      temp: true,
      serverTs: 1
    };

    mconfig.queryId = queryId;

    mconfig.filters = Object.keys(filtersFractions).map(fieldId => ({
      fieldId: fieldId,
      fractions: filtersFractions[fieldId]
    }));

    let payload: api.ToBlockmlProcessQueryResponsePayload = {
      mconfig: mconfig,
      query: query
    };

    return payload;
  }
}
