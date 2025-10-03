import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { BackendConfig } from '~backend/config/backend-config';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { mconfigsTable } from '~backend/drizzle/postgres/schema/mconfigs';
import { ModelEnt } from '~backend/drizzle/postgres/schema/models';
import { ProjectEnt } from '~backend/drizzle/postgres/schema/projects';
import { StructEnt } from '~backend/drizzle/postgres/schema/structs';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { PROJECT_ENV_PROD } from '~common/constants/top';
import { ConnectionTypeEnum } from '~common/enums/connection-type.enum';
import { ParameterEnum } from '~common/enums/docs/parameter.enum';
import { ErEnum } from '~common/enums/er.enum';
import { QueryStatusEnum } from '~common/enums/query-status.enum';
import { StoreMethodEnum } from '~common/enums/store-method.enum';
import { isDefined } from '~common/functions/is-defined';
import { isUndefined } from '~common/functions/is-undefined';
import { ConnectionOptions } from '~common/interfaces/backend/connection/connection-options';
import { Mconfig } from '~common/interfaces/blockml/mconfig';
import { Query } from '~common/interfaces/blockml/query';
import { ServerError } from '~common/models/server-error';
import { decryptData } from '~node-common/functions/encryption/decrypt-data';
import { makeQueryId } from '~node-common/functions/make-query-id';
import { EnvsService } from './envs.service';
import { StoreService } from './store.service';

@Injectable()
export class MconfigsService {
  constructor(
    private envsService: EnvsService,
    private storeService: StoreService,
    private cs: ConfigService<BackendConfig>,
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

    if (isUndefined(mconfig)) {
      throw new ServerError({
        message: ErEnum.BACKEND_MCONFIG_DOES_NOT_EXIST
      });
    }

    return mconfig;
  }

  async prepStoreMconfigQuery(item: {
    struct: StructEnt;
    project: ProjectEnt;
    envId: string;
    model: ModelEnt;
    mconfig: Mconfig;
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

    let newMconfig: Mconfig;
    let newQuery: Query;

    let isError = false;
    let errorMessage: string;

    newMconfig = await this.storeService.adjustMconfig({
      mconfig: mconfig,
      model: model,
      caseSensitiveStringFilters:
        struct.mproveConfig.caseSensitiveStringFilters,
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
      input: model.storeContent.request,
      mconfig: newMconfig,
      storeModel: model,
      storeParam: ParameterEnum.Request,
      caseSensitiveStringFilters:
        struct.mproveConfig.caseSensitiveStringFilters,
      metricsStartDateYYYYMMDD: undefined,
      metricsEndDateYYYYMMDD: undefined
    });

    if (isDefined(processedRequest.errorMessage)) {
      isError = true;
      errorMessage = `store request processing Error: ${processedRequest.errorMessage}`;
    }

    let apiUrlPath =
      isError === true
        ? errorMessage
        : (JSON.parse(processedRequest.result) as any).urlPath;

    let cnOptions = decryptData<ConnectionOptions>({
      encryptedString: connection.options,
      keyBase64: this.cs.get<BackendConfig['backendAesKey']>('backendAesKey')
    });

    let connectionBaseUrl =
      connection.type === ConnectionTypeEnum.Api
        ? cnOptions.storeApi.baseUrl
        : connection.type === ConnectionTypeEnum.GoogleApi
          ? cnOptions.storeGoogleApi.baseUrl
          : '';

    let apiUrl =
      isError === true ? errorMessage : connectionBaseUrl + apiUrlPath;

    let apiBody =
      isError === true
        ? errorMessage
        : JSON.parse(processedRequest.result).body;

    let queryId = makeQueryId({
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      sql: undefined, // isStore true
      store: model.storeContent,
      storeTransformedRequestString: processedRequest.result
    });

    newQuery = {
      queryId: queryId,
      projectId: project.projectId,
      envId: envId,
      connectionId: model.connectionId,
      connectionType: model.connectionType,
      sql: undefined,
      apiMethod: model.storeContent.method as StoreMethodEnum,
      apiUrl: apiUrl,
      apiBody: apiBody,
      status: isError === true ? QueryStatusEnum.Error : QueryStatusEnum.New,
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
      reqTemplate: model.storeContent.request,
      reqFunction: processedRequest.userCode,
      reqJsonParts: processedRequest.result,
      reqBody: JSON.stringify(apiBody),
      reqUrlPath: apiUrlPath
    };

    return { isError: isError, newMconfig: newMconfig, newQuery: newQuery };
  }
}
