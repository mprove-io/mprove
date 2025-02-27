import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { common } from '~backend/barrels/common';
import { nodeCommon } from '~backend/barrels/node-common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { StoreService } from './store.service';

@Injectable()
export class MconfigsService {
  constructor(
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

    // let mconfig = await this.mconfigsRepository.findOne({
    //   where: {
    //     mconfig_id: mconfigId,
    //     struct_id: structId
    //   }
    // });

    if (common.isUndefined(mconfig)) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }

  async prepMconfigQuery(item: {
    struct: schemaPostgres.StructEnt;
    project: schemaPostgres.ProjectEnt;
    envId: string;
    model: schemaPostgres.ModelEnt;
    mconfig: common.Mconfig;
  }) {
    let { model, struct, mconfig, project, envId } = item;

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;
    let errorMessage: string;

    newMconfig = await this.storeService.adjustMconfig({
      mconfig: mconfig,
      model: model,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
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

    let connection = await this.db.drizzle.query.connectionsTable.findFirst({
      where: and(
        eq(connectionsTable.projectId, project.projectId),
        eq(connectionsTable.connectionId, model.connectionId)
      )
    });

    let processedUrlPath = await this.storeService.transformStoreRequestPart({
      input: (model.content as common.FileStore).url_path,
      mconfig: newMconfig,
      storeModel: model,
      storeParam: common.ParameterEnum.UrlPath,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
    });

    if (common.isDefined(processedUrlPath.errorMessage)) {
      isError = true;
      errorMessage = `store url_path processing Error: ${processedUrlPath.errorMessage}`;
    }

    let apiUrl = common.isDefined(processedUrlPath.errorMessage)
      ? `store.url_path Error: ${processedUrlPath.errorMessage}`
      : connection.baseUrl + JSON.parse(processedUrlPath.result);

    let processedBody = await this.storeService.transformStoreRequestPart({
      input: (model.content as common.FileStore).body,
      mconfig: newMconfig,
      storeModel: model,
      storeParam: common.ParameterEnum.Body,
      caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
    });

    if (common.isDefined(processedBody.errorMessage)) {
      isError = true;
      let errorMessagePrefix = common.isDefined(errorMessage)
        ? `${errorMessage}, `
        : '';
      errorMessage = `${errorMessagePrefix}store body processing Error: ${processedBody.errorMessage}`;
    }

    let apiBody = common.isDefined(processedBody.errorMessage)
      ? `store.body Error: ${processedBody.errorMessage}`
      : processedBody.result;

    // console.log('apiBody');
    // console.log(apiBody);

    let queryId = nodeCommon.makeQueryId({
      sql: undefined,
      storeStructId: struct.structId,
      storeModelId: model.modelId,
      storeMethod: (model.content as common.FileStore)
        .method as common.StoreMethodEnum,
      storeUrlPath: apiUrl,
      storeBody: apiBody,
      orgId: project.orgId,
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId
    });

    // console.log('queryId');
    // console.log(queryId);

    newQuery = {
      queryId: queryId,
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      storeModelId: model.modelId,
      storeStructId: model.structId,
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
      urlPath: (model.content as common.FileStore).url_path,
      urlPathFunc: processedUrlPath.userCode,
      urlPathFuncResult: processedUrlPath.result,
      body: (model.content as common.FileStore).body,
      bodyFunc: processedBody.userCode,
      bodyFuncResult: processedBody.result
    };

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
