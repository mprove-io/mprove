import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { and, eq } from 'drizzle-orm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToBlockml } from '~backend/barrels/api-to-blockml';
import { common } from '~backend/barrels/common';
import { helper } from '~backend/barrels/helper';
import { interfaces } from '~backend/barrels/interfaces';
import { nodeCommon } from '~backend/barrels/node-common';
import { schemaPostgres } from '~backend/barrels/schema-postgres';
import { AttachUser } from '~backend/decorators/_index';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { connectionsTable } from '~backend/drizzle/postgres/schema/connections';
import { queriesTable } from '~backend/drizzle/postgres/schema/queries';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { makeTsNumber } from '~backend/functions/make-ts-number';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { BranchesService } from '~backend/services/branches.service';
import { BridgesService } from '~backend/services/bridges.service';
import { EnvsService } from '~backend/services/envs.service';
import { MembersService } from '~backend/services/members.service';
import { ModelsService } from '~backend/services/models.service';
import { ProjectsService } from '~backend/services/projects.service';
import { RabbitService } from '~backend/services/rabbit.service';
import { StoreService } from '~backend/services/store.service';
import { StructsService } from '~backend/services/structs.service';
import { WrapToApiService } from '~backend/services/wrap-to-api.service';
import { WrapToEntService } from '~backend/services/wrap-to-ent.service';

let retry = require('async-retry');

@UseGuards(ValidateRequestGuard)
@Controller()
export class CreateTempMconfigAndQueryController {
  constructor(
    private projectsService: ProjectsService,
    private modelsService: ModelsService,
    private membersService: MembersService,
    private rabbitService: RabbitService,
    private branchesService: BranchesService,
    private structsService: StructsService,
    private bridgesService: BridgesService,
    private envsService: EnvsService,
    private wrapToEntService: WrapToEntService,
    private wrapToApiService: WrapToApiService,
    private storeService: StoreService,
    private cs: ConfigService<interfaces.Config>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(
    apiToBackend.ToBackendRequestInfoNameEnum.ToBackendCreateTempMconfigAndQuery
  )
  async createTempMconfigAndQuery(
    @AttachUser() user: schemaPostgres.UserEnt,
    @Req() request: any
  ) {
    let reqValid: apiToBackend.ToBackendCreateTempMconfigAndQueryRequest =
      request.body;

    let { traceId } = reqValid.info;
    let { mconfig, projectId, isRepoProd, branchId, envId } = reqValid.payload;

    let repoId = isRepoProd === true ? common.PROD_REPO_ID : user.userId;

    let project = await this.projectsService.getProjectCheckExists({
      projectId: projectId
    });

    let member = await this.membersService.getMemberCheckExists({
      projectId: projectId,
      memberId: user.userId
    });

    let branch = await this.branchesService.getBranchCheckExists({
      projectId: projectId,
      repoId: repoId,
      branchId: branchId
    });

    let env = await this.envsService.getEnvCheckExistsAndAccess({
      projectId: projectId,
      envId: envId,
      member: member
    });

    let bridge = await this.bridgesService.getBridgeCheckExists({
      projectId: branch.projectId,
      repoId: branch.repoId,
      branchId: branch.branchId,
      envId: envId
    });

    let struct = await this.structsService.getStructCheckExists({
      structId: bridge.structId,
      projectId: projectId
    });

    let model = await this.modelsService.getModelCheckExists({
      structId: bridge.structId,
      modelId: mconfig.modelId
    });

    if (mconfig.structId !== bridge.structId) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_STRUCT_ID_CHANGED
      });
    }

    let isAccessGranted = helper.checkAccess({
      userAlias: user.alias,
      member: member,
      entity: model
    });

    if (isAccessGranted === false) {
      throw new common.ServerError({
        message: common.ErEnum.BACKEND_FORBIDDEN_MODEL
      });
    }

    let newMconfig: common.Mconfig;
    let newQuery: common.Query;

    let isError = false;
    let errorMessage: string;

    if (model.isStoreModel === true) {
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
          eq(connectionsTable.projectId, projectId),
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
        projectId: projectId,
        envId: envId,
        connectionId: model.connectionId
      });

      // console.log('queryId');
      // console.log(queryId);

      newQuery = {
        queryId: queryId,
        projectId: projectId,
        envId: envId,
        connectionId: model.connectionId,
        storeModelId: model.modelId,
        storeStructId: model.structId,
        connectionType: (model.content as any).connection.type,
        // sql: undefined,
        sql: `--- method
${(model.content as common.FileStore).method}
--- url
${apiUrl}
--- body store
${apiBody}
--- urlPathResult inputSub
${processedUrlPath.userCode}
--- body inputSub
${processedBody.userCode}
--- newMconfig
${JSON.stringify(newMconfig)}
`,
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
    } else {
      let toBlockmlProcessQueryRequest: apiToBlockml.ToBlockmlProcessQueryRequest =
        {
          info: {
            name: apiToBlockml.ToBlockmlRequestInfoNameEnum
              .ToBlockmlProcessQuery,
            traceId: traceId
          },
          payload: {
            orgId: project.orgId,
            projectId: project.projectId,
            weekStart: struct.weekStart,
            caseSensitiveStringFilters: struct.caseSensitiveStringFilters,
            simplifySafeAggregates: struct.simplifySafeAggregates,
            udfsDict: struct.udfsDict,
            mconfig: mconfig,
            modelContent: model.content,
            envId: envId
          }
        };

      let blockmlProcessQueryResponse =
        await this.rabbitService.sendToBlockml<apiToBlockml.ToBlockmlProcessQueryResponse>(
          {
            routingKey: common.RabbitBlockmlRoutingEnum.ProcessQuery.toString(),
            message: toBlockmlProcessQueryRequest,
            checkIsOk: true
          }
        );

      newMconfig = blockmlProcessQueryResponse.payload.mconfig;
      newQuery = blockmlProcessQueryResponse.payload.query;
    }

    let newQueryEnt = this.wrapToEntService.wrapToEntityQuery(newQuery);
    let newMconfigEnt = this.wrapToEntService.wrapToEntityMconfig(newMconfig);

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                mconfigs: [newMconfigEnt]
              },
              insertOrUpdate: {
                queries: isError === true ? [newQueryEnt] : []
              },
              insertOrDoNothing: {
                queries: isError === true ? [] : [newQueryEnt]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let query = await this.db.drizzle.query.queriesTable.findFirst({
      where: and(
        eq(queriesTable.queryId, newQuery.queryId),
        eq(queriesTable.projectId, newQuery.projectId)
      )
    });

    // let query = await this.queriesRepository.findOne({
    //   where: {
    //     query_id: newQuery.queryId,
    //     project_id: newQuery.projectId
    //   }
    // });

    // let records = await this.dbService.writeRecords({
    //   modify: false,
    //   records: {
    //     mconfigs: [wrapper.wrapToEntityMconfig(newMconfig)],
    //     queries: common.isDefined(query)
    //       ? []
    //       : [wrapper.wrapToEntityQuery(newQuery)]
    //   }
    // });

    let payload: apiToBackend.ToBackendCreateTempMconfigAndQueryResponsePayload =
      {
        mconfig: this.wrapToApiService.wrapToApiMconfig({
          mconfig: newMconfigEnt,
          modelFields: model.fields
        }),
        query: common.isDefined(query)
          ? this.wrapToApiService.wrapToApiQuery(query)
          : this.wrapToApiService.wrapToApiQuery(newQueryEnt)
      };

    return payload;
  }
}
