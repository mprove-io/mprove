import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { nodeCommon } from '~backend/barrels/node-common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { EnvsService } from './envs.service';
import { StoreService } from './store.service';

@Injectable()
export class MconfigsService {
  constructor(
    private envsService: EnvsService,
    private storeService: StoreService,
    @Inject(DRIZZLE) private db: Db
  ) {}

  async getMconfigCheckExists(item: { mconfigId: string; structId: string }) {
    let { mconfigId, structId } = item;

    let mconfig = await this.db.drizzle.query.mconfigsTable.findFirst({
      where: and(
        eq(mconfigsTable.mconfigId, mconfigId),
        eq(mconfigsTable.structId, structId)
      )
    });

    if (common.isUndefined(mconfig)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }

  async prepStoreMconfigQuery(item: {
    struct: schemaPostgres.StructEnt;
    project: schemaPostgres.ProjectEnt;
    envId: string;
    model: schemaPostgres.ModelEnt;
    mconfig: common.Mconfig;
    metricsStartDateYYYYMMDD: string;
    metricsEndDateYYYYMMDD: string;
  }) {
    let {
      model,
      struct,
      mconfig,
      project,
      envId,
      metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD
    } = item;

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;
    let errorMessage: string;

    newMconfig = await this.storeService.adjustMconfig({
      mconfig: mconfig,
      model: model,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: metricsStartDateYYYYMMDD,
      metricsEndDateYYYYMMDD: metricsEndDateYYYYMMDD
    });

    // console.log('newMconfig:');
    // console.log(newMconfig);

    // newMconfig.filters.forEach((filter, filterIndex) => {
    //   console.log(`Filter ${filterIndex} fractions:`);
    //   console.log(filter.fractions);
    //   filter.fractions.forEach((fraction, frIndex) => {
    //     console.log(`Filter ${filterIndex} Fraction ${frIndex} controls:`);
    //     console.log(fraction.controls);
    //     fraction.controls.forEach((control, cIndex) => {
    //       console.log(
    //         `Filter ${filterIndex} Fraction ${frIndex} Control ${cIndex} options:`
    //       );
    //       console.log(control?.options);
    //     });
    //   });
    // });

    let apiEnvs = await this.envsService.getApiEnvs({
      projectId: project.projectId
    });

    let apiEnv = apiEnvs.find(x => x.envId === envId);

    let connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.projectId, project.projectId),
        eq(
          connectionsTable.envId,
          apiEnv.fallbackConnectionIds.indexOf(model.connectionId) > -1
            ? PROJECT_ENV_PROD
            : envId
        ),
        eq(connectionsTable.connectionId, model.connectionId)
      )
    });

    let processedRequest = await this.storeService.transformStoreRequest({
      input: (model.content as common.FileStore).request,
      mconfig: newMconfig,
      storeModel: model,
      storeParam: common.ParameterEnum.Request,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
    });

    if (common.isDefined(processedRequest.errorMessage)) {
      isError = true;
      errorMessage = `store request processing Error: ${processedRequest.errorMessage}`;
    }

    let apiUrlPath =
      isError === true
        ? errorMessage
        : (JSON.parse(processedRequest.result) as any).urlPath;

    let apiUrl =
      isError === true ? errorMessage : connection.baseUrl + apiUrlPath;

    let apiBody =
      isError === true
        ? errorMessage
        : JSON.parse(processedRequest.result).body;

    let queryId = nodeCommon.makeQueryId({
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      sql: undefined, // isStore true
      store: model.content as common.FileStore,
      storeTransformedRequestString: processedRequest.result
    });

    newQuery = {
      queryId: queryId,
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      connectionType: (model.content as any).connection.type,
      sql: undefined,
      apiMethod: (model.content as common.FileStore)
        .method as common.StoreMethodEnum,
      apiUrl: apiUrl,
      apiBody: apiBody,
      status:
        isError === true
          ? common.QueryStatusEnum.Error
          : common.QueryStatusEnum.New,
      lastRunBy: undefined,
      lastRunTs: undefined,
      lastCancelTs: undefined,
      lastCompleteTs: undefined,
      lastCompleteDuration: undefined,
      lastErrorMessage: errorMessage,
      lastErrorTs: isError === true ? makeTsNumber() : undefined,
      data: undefined,
      queryJobId: undefined,
      bigqueryQueryJobId: undefined,
      bigqueryConsecutiveErrorsGetJob: 0,
      bigqueryConsecutiveErrorsGetResults: 0,
      serverTs: 1
    };

    newMconfig.queryId = newQuery.queryId;
    newMconfig.temp = true;
    newMconfig.storePart = {
      reqTemplate: (model.content as common.FileStore).request,
      reqFunction: processedRequest.userCode,
      reqJsonParts: processedRequest.result,
      reqBody: JSON.stringify(apiBody),
      reqUrlPath: apiUrlPath
    };

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
