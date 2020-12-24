import { Injectable } from '@nestjs/common';
import { api } from '../barrels/api';
import { enums } from '../barrels/enums';
import { interfaces } from '../barrels/interfaces';
import { barSpecial } from '../barrels/bar-special';
import { helper } from '../barrels/helper';
import { RabbitService } from './rabbit.service';

@Injectable()
export class QueryService {
  constructor(private readonly rabbitService: RabbitService) {}

  async processQuery(item: {
    traceId: string;
    structId: string;
    organizationId: string;
    projectId: string;
    weekStart: api.ProjectWeekStartEnum;
    udfsDict: api.UdfsDict;
    mconfig: api.Mconfig;
    model: interfaces.Model;
  }) {
    let {
      traceId,
      structId,
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

    let { sql, filtersFractions, varsSqlElements } = await barSpecial.genSql(
      this.rabbitService,
      traceId,
      {
        model: model,
        select: select,
        sorts: sorts,
        timezone: timezone,
        limit: limit.toString(),
        filters: newFilters,
        weekStart: weekStart,
        udfsDict: udfsDict,
        structId: structId
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
